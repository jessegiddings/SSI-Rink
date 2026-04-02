'use client';

import { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, X, Repeat, Calendar } from 'lucide-react';
import { Session, SessionType } from '@/lib/types';
import { sampleSessionTypes, sampleSessions } from '@/lib/sample-data';
import { formatTime } from '@/lib/utils';

export default function AdminSchedulePage() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    session_type_id: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    start_time: '10:00',
    capacity: 20,
    price_override_adult: '',
    price_override_child: '',
    price_override_family: '',
    notes: '',
    // Recurring options
    recurring_weeks: 4,
    recurring_days: [1] as number[], // 0=Sun, 1=Mon, etc.
  });

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  useEffect(() => {
    loadData();
  }, [currentWeekStart]);

  async function loadData() {
    setLoading(true);
    const startDate = format(currentWeekStart, 'yyyy-MM-dd');
    const endDate = format(addDays(currentWeekStart, 6), 'yyyy-MM-dd');

    try {
      const [sessionsRes, typesRes] = await Promise.all([
        fetch(`/api/sessions?start=${startDate}&end=${endDate}`),
        fetch('/api/admin/session-types'),
      ]);

      if (sessionsRes.ok) setSessions(await sessionsRes.json());
      else setSessions(sampleSessions.filter((s) => s.date >= startDate && s.date <= endDate));

      if (typesRes.ok) setSessionTypes(await typesRes.json());
      else setSessionTypes(sampleSessionTypes);
    } catch {
      const startDate = format(currentWeekStart, 'yyyy-MM-dd');
      const endDate = format(addDays(currentWeekStart, 6), 'yyyy-MM-dd');
      setSessions(sampleSessions.filter((s) => s.date >= startDate && s.date <= endDate));
      setSessionTypes(sampleSessionTypes);
    }
    setLoading(false);
  }

  async function createSession() {
    const selectedType = sessionTypes.find((st) => st.id === formData.session_type_id);
    if (!selectedType) return;

    const endMinutes =
      parseInt(formData.start_time.split(':')[0]) * 60 +
      parseInt(formData.start_time.split(':')[1]) +
      selectedType.duration_min;
    const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`;

    const payload = {
      session_type_id: formData.session_type_id,
      date: formData.date,
      start_time: formData.start_time,
      end_time: endTime,
      capacity: formData.capacity,
      spots_remaining: formData.capacity,
      price_override_adult: formData.price_override_adult ? parseFloat(formData.price_override_adult) : null,
      price_override_child: formData.price_override_child ? parseFloat(formData.price_override_child) : null,
      price_override_family: formData.price_override_family ? parseFloat(formData.price_override_family) : null,
      notes: formData.notes || null,
      is_recurring: isRecurring,
      recurring_weeks: isRecurring ? formData.recurring_weeks : undefined,
      recurring_days: isRecurring ? formData.recurring_days : undefined,
    };

    try {
      const res = await fetch('/api/admin/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await loadData();
        setShowCreateForm(false);
      }
    } catch {
      // Will work once Supabase is connected
    }
  }

  async function cancelSession(id: string) {
    if (!confirm('Cancel this session? Booked users will be notified.')) return;
    try {
      await fetch(`/api/admin/sessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      await loadData();
    } catch {
      // Will work once Supabase is connected
    }
  }

  function getSessionsForDay(day: Date) {
    const dateStr = format(day, 'yyyy-MM-dd');
    return sessions
      .filter((s) => s.date === dateStr)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }

  function getTypeName(typeId: string) {
    const st = sessionTypes.find((t) => t.id === typeId);
    return st?.name ?? 'Unknown';
  }

  function getTypeColor(typeId: string) {
    const st = sessionTypes.find((t) => t.id === typeId);
    return st?.color_hex ?? '#999';
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy">Schedule Builder</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex items-center gap-1 bg-ice-blue text-white font-medium text-sm px-4 py-2 rounded-lg min-h-[44px] hover:bg-ice-blue-dark transition-colors"
        >
          {showCreateForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showCreateForm ? 'Cancel' : 'Create Session'}
        </button>
      </div>

      {/* Create form */}
      {showCreateForm && (
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setIsRecurring(false)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium ${
                !isRecurring ? 'bg-ice-blue text-white' : 'text-gray-500 hover:bg-frost'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Single
            </button>
            <button
              onClick={() => setIsRecurring(true)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium ${
                isRecurring ? 'bg-ice-blue text-white' : 'text-gray-500 hover:bg-frost'
              }`}
            >
              <Repeat className="w-4 h-4" />
              Recurring
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Session Type
              </label>
              <select
                value={formData.session_type_id}
                onChange={(e) => {
                  const st = sessionTypes.find((t) => t.id === e.target.value);
                  setFormData({
                    ...formData,
                    session_type_id: e.target.value,
                    capacity: st?.default_capacity ?? 20,
                  });
                }}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm min-h-[44px]"
              >
                <option value="">Select type...</option>
                {sessionTypes.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>

            {!isRecurring && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm min-h-[44px]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Start Time</label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Capacity</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Adult Price Override ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price_override_adult}
                onChange={(e) => setFormData({ ...formData, price_override_adult: e.target.value })}
                placeholder="Use default"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional notes..."
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm min-h-[44px]"
              />
            </div>
          </div>

          {isRecurring && (
            <div className="mt-4 p-3 bg-frost rounded-lg">
              <div className="text-xs font-medium text-gray-500 mb-2">Repeat on:</div>
              <div className="flex gap-2 flex-wrap">
                {dayNames.map((name, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const days = formData.recurring_days.includes(i)
                        ? formData.recurring_days.filter((d) => d !== i)
                        : [...formData.recurring_days, i];
                      setFormData({ ...formData, recurring_days: days });
                    }}
                    className={`w-10 h-10 rounded-lg text-xs font-medium ${
                      formData.recurring_days.includes(i)
                        ? 'bg-ice-blue text-white'
                        : 'bg-white text-gray-500 border border-gray-200'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Repeat for (weeks)
                </label>
                <input
                  type="number"
                  value={formData.recurring_weeks}
                  onChange={(e) =>
                    setFormData({ ...formData, recurring_weeks: parseInt(e.target.value) || 1 })
                  }
                  min={1}
                  max={52}
                  className="w-24 px-3 py-2 rounded-lg border border-gray-200 text-sm min-h-[44px]"
                />
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <button
              onClick={createSession}
              disabled={!formData.session_type_id}
              className="bg-green text-white font-medium text-sm px-6 py-2 rounded-lg min-h-[44px] hover:bg-green/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRecurring ? 'Create Recurring Sessions' : 'Create Session'}
            </button>
          </div>
        </div>
      )}

      {/* Week navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}
          className="p-2 rounded-lg hover:bg-white min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold text-navy">
          {format(currentWeekStart, 'MMM d')} — {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
        </span>
        <button
          onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
          className="p-2 rounded-lg hover:bg-white min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {weekDays.map((day) => {
          const daySessions = getSessionsForDay(day);
          return (
            <div key={day.toISOString()} className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="bg-navy text-white text-center py-2 text-sm font-medium">
                <div>{format(day, 'EEE')}</div>
                <div className="text-lg font-bold">{format(day, 'MMM d')}</div>
              </div>
              <div className="p-2 space-y-2 min-h-[100px]">
                {loading ? (
                  <div className="h-12 bg-frost rounded animate-pulse" />
                ) : daySessions.length === 0 ? (
                  <div className="text-center py-4 text-gray-300 text-xs">Empty</div>
                ) : (
                  daySessions.map((session) => (
                    <div
                      key={session.id}
                      className={`rounded-lg p-2 text-xs border-l-3 ${
                        session.status === 'cancelled' ? 'opacity-50 bg-gray-100' : 'bg-frost'
                      }`}
                      style={{
                        borderLeftColor:
                          session.status === 'cancelled' ? '#999' : getTypeColor(session.session_type_id),
                      }}
                    >
                      <div className="font-semibold truncate" style={{ color: getTypeColor(session.session_type_id) }}>
                        {session.session_type?.name || getTypeName(session.session_type_id)}
                      </div>
                      <div className="text-gray-500">
                        {formatTime(session.start_time)} — {formatTime(session.end_time)}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-gray-400">
                          {session.spots_remaining}/{session.capacity} spots
                        </span>
                        {session.status !== 'cancelled' && (
                          <button
                            onClick={() => cancelSession(session.id)}
                            className="text-red hover:underline"
                          >
                            Cancel
                          </button>
                        )}
                        {session.status === 'cancelled' && (
                          <span className="text-red font-medium">Cancelled</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
