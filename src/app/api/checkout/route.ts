import { NextRequest, NextResponse } from 'next/server';
import { getSession, getSessionTypes } from '@/lib/data';
import { getSessionTypeForSession } from '@/lib/utils';

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Stripe is not configured. Booking will be created in demo mode.' },
      { status: 503 }
    );
  }

  try {
    const { getStripe } = await import('@/lib/stripe');
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

    const session = await getSession(session_id);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.status !== 'active' || session.spots_remaining === 0) {
      return NextResponse.json({ error: 'Session is not available' }, { status: 400 });
    }

    const totalPeople = num_adults + num_children + (is_family ? 1 : 0);
    if (!is_family && totalPeople > session.spots_remaining) {
      return NextResponse.json({ error: 'Not enough spots available' }, { status: 400 });
    }

    const sessionTypes = await getSessionTypes();
    const sessionType = getSessionTypeForSession(session, sessionTypes);
    const sessionTypeName = sessionType?.name || 'Skating Session';

    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

    // Build line items
    const lineItems: Array<{
      price_data: {
        currency: string;
        product_data: { name: string; description?: string };
        unit_amount: number;
      };
      quantity: number;
    }> = [];

    if (is_family) {
      const familyPrice = session.price_override_family ?? sessionType?.default_price_family ?? 0;
      lineItems.push({
        price_data: {
          currency: 'cad',
          product_data: {
            name: `${sessionTypeName} — Family`,
            description: `${session.date} ${session.start_time.slice(0, 5)}`,
          },
          unit_amount: Math.round(familyPrice * 100),
        },
        quantity: 1,
      });
    } else {
      if (num_adults > 0) {
        const adultPrice = session.price_override_adult ?? sessionType?.default_price_adult ?? 0;
        lineItems.push({
          price_data: {
            currency: 'cad',
            product_data: {
              name: `${sessionTypeName} — Adult`,
              description: `${session.date} ${session.start_time.slice(0, 5)}`,
            },
            unit_amount: Math.round(adultPrice * 100),
          },
          quantity: num_adults,
        });
      }
      if (num_children > 0) {
        const childPrice = session.price_override_child ?? sessionType?.default_price_child ?? 0;
        lineItems.push({
          price_data: {
            currency: 'cad',
            product_data: {
              name: `${sessionTypeName} — Child`,
              description: `${session.date} ${session.start_time.slice(0, 5)}`,
            },
            unit_amount: Math.round(childPrice * 100),
          },
          quantity: num_children,
        });
      }
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: guest_email,
      line_items: lineItems,
      metadata: {
        session_id,
        guest_name,
        guest_email,
        num_adults: String(num_adults),
        num_children: String(num_children),
        is_family: String(is_family),
        total_price: String(total_price),
      },
      success_url: `${appUrl}/booking/confirmation?checkout_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/book/${session_id}`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Checkout error:', error);
    const message = error instanceof Error ? error.message : 'Checkout failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
