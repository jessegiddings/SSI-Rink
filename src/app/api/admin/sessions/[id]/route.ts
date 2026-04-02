import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
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
    .from('sessions')
    .update(body)
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

  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
