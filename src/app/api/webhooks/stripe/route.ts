import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { generateQRCode } from '@/lib/qr';
import { sendBookingConfirmation, sendAdminBookingNotification } from '@/lib/email';
import { formatTime } from '@/lib/utils';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook verification failed';
    console.error('Webhook signature verification failed:', message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;
    const metadata = checkoutSession.metadata;

    if (!metadata?.session_id) {
      console.error('No session_id in checkout metadata');
      return NextResponse.json({ received: true });
    }

    try {
      await processBooking(checkoutSession);
    } catch (error) {
      console.error('Error processing booking from webhook:', error);
    }
  }

  return NextResponse.json({ received: true });
}

async function processBooking(checkoutSession: Stripe.Checkout.Session) {
  const metadata = checkoutSession.metadata!;
  const sessionId = metadata.session_id;
  const guestName = metadata.guest_name;
  const guestEmail = metadata.guest_email;
  const numAdults = parseInt(metadata.num_adults) || 0;
  const numChildren = parseInt(metadata.num_children) || 0;
  const isFamily = metadata.is_family === 'true';
  const totalPrice = parseFloat(metadata.total_price) || 0;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.log('Supabase not configured — skipping database write');
    return;
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  // Create booking
  const bookingId = crypto.randomUUID();
  const qrCode = await generateQRCode({ bookingId, type: 'booking' });

  const { error: bookingError } = await supabase.from('bookings').insert({
    id: bookingId,
    session_id: sessionId,
    guest_name: guestName,
    guest_email: guestEmail,
    num_adults: numAdults,
    num_children: numChildren,
    is_family: isFamily,
    total_price: totalPrice,
    payment_status: 'paid',
    stripe_payment_id: checkoutSession.payment_intent as string,
    qr_code: qrCode,
  });

  if (bookingError) {
    console.error('Error creating booking:', bookingError);
    return;
  }

  // Update spots remaining
  const spotsUsed = isFamily ? 1 : numAdults + numChildren;
  const { data: session } = await supabase
    .from('sessions')
    .select('spots_remaining')
    .eq('id', sessionId)
    .single();

  if (session) {
    const newSpots = Math.max(0, session.spots_remaining - spotsUsed);
    await supabase
      .from('sessions')
      .update({
        spots_remaining: newSpots,
        status: newSpots === 0 ? 'full' : 'active',
      })
      .eq('id', sessionId);
  }

  // Get session details for email
  const { data: sessionData } = await supabase
    .from('sessions')
    .select('*, session_type:session_types(*)')
    .eq('id', sessionId)
    .single();

  if (sessionData) {
    const emailData = {
      guestName,
      guestEmail,
      sessionTypeName: sessionData.session_type?.name || 'Skating Session',
      date: sessionData.date,
      startTime: formatTime(sessionData.start_time),
      endTime: formatTime(sessionData.end_time),
      numAdults,
      numChildren,
      isFamily,
      totalPrice,
      bookingId,
      qrCodeDataUrl: qrCode,
    };

    // Send emails (best-effort — don't fail booking if email fails)
    try {
      await sendBookingConfirmation(emailData);
    } catch (e) {
      console.error('Failed to send confirmation email:', e);
    }

    try {
      await sendAdminBookingNotification(emailData);
    } catch (e) {
      console.error('Failed to send admin notification:', e);
    }
  }
}
