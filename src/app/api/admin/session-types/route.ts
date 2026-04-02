import { NextRequest, NextResponse } from 'next/server';
import { getSessionTypes } from '@/lib/data';

export async function GET() {
  try {
    const sessionTypes = await getSessionTypes();
    return NextResponse.json(sessionTypes);
  } catch (error) {
    console.error('Error fetching session types:', error);
    return NextResponse.json({ error: 'Failed to fetch session types' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const body = await request.json();
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('session_types')
    .insert({
      name: body.name,
      duration_min: body.duration_min,
      default_capacity: body.default_capacity,
      default_price_adult: body.default_price_adult,
      default_price_child: body.default_price_child,
      default_price_family: body.default_price_family,
      color_hex: body.color_hex,
      description: body.description,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}
