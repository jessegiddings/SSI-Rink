import { NextRequest, NextResponse } from 'next/server';
import { getSessions } from '@/lib/data';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  if (!start || !end) {
    return NextResponse.json({ error: 'start and end query params required' }, { status: 400 });
  }

  try {
    const sessions = await getSessions(start, end);
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}
