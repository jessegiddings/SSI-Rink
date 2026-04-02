import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id');
  if (!sessionId) {
    return NextResponse.json({ error: 'session_id required' }, { status: 400 });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  // Look up the booking by the Stripe payment intent from the checkout session
  try {
    const { getStripe } = await import('@/lib/stripe');
    const stripe = getStripe();
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (!checkoutSession.metadata?.session_id) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const paymentIntentId = checkoutSession.payment_intent as string;

    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('bookings')
      .select('*, session:sessions(*, session_type:session_types(*))')
      .eq('stripe_payment_id', paymentIntentId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to look up booking' }, { status: 500 });
  }
}
