import { NextRequest, NextResponse } from 'next/server';
import { generateQRCode } from '@/lib/qr';
import { getSession, getSessionTypes } from '@/lib/data';
import { formatTime, getSessionTypeForSession } from '@/lib/utils';
import { sendBookingConfirmation, sendAdminBookingNotification } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      session_id,
      guest_name,
      guest_email,
      num_adults,
      num_children,
      is_family,
      total_price,
    } = body;

    if (!session_id || !guest_email || !guest_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate session exists and is available
    const session = await getSession(session_id);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.status !== 'active' || session.spots_remaining === 0) {
      return NextResponse.json({ error: 'Session is not available' }, { status: 400 });
    }

    const bookingId = crypto.randomUUID();
    const qrCode = await generateQRCode({ bookingId, type: 'booking' });

    // If Supabase is configured, save to database
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const { createClient } = await import('@/lib/supabase/server');
      const supabase = await createClient();

      const { error: bookingError } = await supabase.from('bookings').insert({
        id: bookingId,
        session_id,
        guest_name,
        guest_email,
        num_adults: num_adults || 0,
        num_children: num_children || 0,
        is_family: is_family || false,
        total_price: total_price || 0,
        payment_status: total_price === 0 ? 'paid' : 'pending',
        qr_code: qrCode,
      });

      if (bookingError) {
        console.error('Error creating booking:', bookingError);
        return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
      }

      // Update spots remaining
      const spotsUsed = is_family ? 1 : (num_adults || 0) + (num_children || 0);
      const newSpots = Math.max(0, session.spots_remaining - spotsUsed);
      await supabase
        .from('sessions')
        .update({
          spots_remaining: newSpots,
          status: newSpots === 0 ? 'full' : 'active',
        })
        .eq('id', session_id);
    }

    // Send confirmation email (best-effort)
    const sessionTypes = await getSessionTypes();
    const sessionType = getSessionTypeForSession(session, sessionTypes);

    if (process.env.RESEND_API_KEY && sessionType) {
      try {
        const emailData = {
          guestName: guest_name,
          guestEmail: guest_email,
          sessionTypeName: sessionType.name,
          date: session.date,
          startTime: formatTime(session.start_time),
          endTime: formatTime(session.end_time),
          numAdults: num_adults || 0,
          numChildren: num_children || 0,
          isFamily: is_family || false,
          totalPrice: total_price || 0,
          bookingId,
          qrCodeDataUrl: qrCode,
        };
        await sendBookingConfirmation(emailData);
        await sendAdminBookingNotification(emailData);
      } catch (e) {
        console.error('Failed to send emails:', e);
      }
    }

    return NextResponse.json({
      id: bookingId,
      session_id,
      guest_name,
      guest_email,
      num_adults,
      num_children,
      is_family,
      total_price,
      payment_status: total_price === 0 ? 'paid' : 'pending',
      qr_code: qrCode,
      session,
      session_type: sessionType,
    }, { status: 201 });
  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
