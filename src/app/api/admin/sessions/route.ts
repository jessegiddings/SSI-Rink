import { NextRequest, NextResponse } from 'next/server';
import { addDays, addWeeks, format } from 'date-fns';

export async function POST(request: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const body = await request.json();
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  if (body.is_recurring && body.recurring_weeks && body.recurring_days) {
    // Create recurring sessions
    const sessionsToInsert = [];
    const startDate = new Date();

    for (let week = 0; week < body.recurring_weeks; week++) {
      const weekStart = addWeeks(startDate, week);
      for (const dayOfWeek of body.recurring_days as number[]) {
        // Calculate the date for this day of the week
        const currentDay = weekStart.getDay();
        const daysToAdd = (dayOfWeek - currentDay + 7) % 7;
        const sessionDate = addDays(weekStart, daysToAdd);

        // Skip dates in the past
        if (sessionDate < new Date()) continue;

        sessionsToInsert.push({
          session_type_id: body.session_type_id,
          date: format(sessionDate, 'yyyy-MM-dd'),
          start_time: body.start_time,
          end_time: body.end_time,
          capacity: body.capacity,
          spots_remaining: body.spots_remaining,
          price_override_adult: body.price_override_adult,
          price_override_child: body.price_override_child,
          price_override_family: body.price_override_family,
          notes: body.notes,
        });
      }
    }

    const { data, error } = await supabase
      .from('sessions')
      .insert(sessionsToInsert)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } else {
    // Create single session
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        session_type_id: body.session_type_id,
        date: body.date,
        start_time: body.start_time,
        end_time: body.end_time,
        capacity: body.capacity,
        spots_remaining: body.spots_remaining,
        price_override_adult: body.price_override_adult,
        price_override_child: body.price_override_child,
        price_override_family: body.price_override_family,
        notes: body.notes,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  }
}
