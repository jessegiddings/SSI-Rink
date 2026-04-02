import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const { id } = await params;
  const body = await request.json();
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('session_types')
    .update({
      name: body.name,
      duration_min: body.duration_min,
      default_capacity: body.default_capacity,
      default_price_adult: body.default_price_adult,
      default_price_child: body.default_price_child,
      default_price_family: body.default_price_family,
      color_hex: body.color_hex,
      description: body.description,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const { id } = await params;
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  // Soft delete: set is_active to false
  const { error } = await supabase
    .from('session_types')
    .update({ is_active: false })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
