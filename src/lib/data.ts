import { Session, SessionType } from './types';
import { sampleSessions, sampleSessionTypes } from './sample-data';

const isSupabaseConfigured =
  typeof process !== 'undefined' &&
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function getSessionTypes(): Promise<SessionType[]> {
  if (!isSupabaseConfigured) {
    return sampleSessionTypes.filter((st) => st.is_active);
  }

  const { createClient } = await import('./supabase/server');
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('session_types')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data ?? [];
}

export async function getSessions(startDate: string, endDate: string): Promise<Session[]> {
  if (!isSupabaseConfigured) {
    return sampleSessions
      .filter((s) => s.date >= startDate && s.date <= endDate)
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.start_time.localeCompare(b.start_time);
      });
  }

  const { createClient } = await import('./supabase/server');
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sessions')
    .select('*, session_type:session_types(*)')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date')
    .order('start_time');

  if (error) throw error;
  return data ?? [];
}

export async function getSession(id: string): Promise<Session | null> {
  if (!isSupabaseConfigured) {
    return sampleSessions.find((s) => s.id === id) ?? null;
  }

  const { createClient } = await import('./supabase/server');
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sessions')
    .select('*, session_type:session_types(*)')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function getUpcomingSessions(limit: number = 5): Promise<Session[]> {
  if (!isSupabaseConfigured) {
    const today = new Date().toISOString().split('T')[0];
    return sampleSessions
      .filter((s) => s.date >= today && s.status === 'active')
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.start_time.localeCompare(b.start_time);
      })
      .slice(0, limit);
  }

  const { createClient } = await import('./supabase/server');
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('sessions')
    .select('*, session_type:session_types(*)')
    .gte('date', today)
    .eq('status', 'active')
    .order('date')
    .order('start_time')
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}
