'use client';

import { useState, useEffect } from 'react';
import {
  format,
  startOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  isToday,
  isSameDay,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Session, SessionType } from '@/lib/types';
import { SessionCard } from './session-card';
import { sampleSessions, sampleSessionTypes } from '@/lib/sample-data';

interface ScheduleViewProps {
  sessionTypes: SessionType[];
}

export function ScheduleView({ sessionTypes }: ScheduleViewProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [filterType, setFilterType] = useState<string>('all');

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  useEffect(() => {
    loadSessions();
  }, [currentWeekStart]);

  async function loadSessions() {
    setLoading(true);
    const startDate = format(currentWeekStart, 'yyyy-MM-dd');
    const endDate = format(addDays(currentWeekStart, 6), 'yyyy-MM-dd');

    try {
      const res = await fetch(`/api/sessions?start=${startDate}&end=${endDate}`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      } else {
        // Fallback to sample data
        const filtered = sampleSessions.filter(
          (s) => s.date >= startDate && s.date <= endDate
        );
        setSessions(filtered);
      }
    } catch {
      const filtered = sampleSessions.filter(
        (s) =>
          s.date >= format(currentWeekStart, 'yyyy-MM-dd') &&
          s.date <= format(addDays(currentWeekStart, 6), 'yyyy-MM-dd')
      );
      setSessions(filtered);
    }
    setLoading(false);
  }

  const filteredSessions = sessions.filter((s) => {
    if (filterType !== 'all') {
      const st = s.session_type || sessionTypes.find((t) => t.id === s.session_type_id);
      if (st && st.id !== filterType) return false;
    }
    return true;
  });

  const getSessionsForDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return filteredSessions
      .filter((s) => s.date === dateStr)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  const allTypes = sessionTypes.length > 0 ? sessionTypes : sampleSessionTypes;

  return (
    <div>
      {/* Week navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}
          className="p-2 rounded-lg hover:bg-frost active:bg-gray-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Previous week"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-navy">
            {format(currentWeekStart, 'MMM d')} — {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
          </span>
          <button
            onClick={() => {
              setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
              setSelectedDay(new Date());
            }}
            className="text-xs text-ice-blue font-medium px-2 py-1 rounded hover:bg-ice-blue/10"
          >
            Today
          </button>
        </div>

        <button
          onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
          className="p-2 rounded-lg hover:bg-frost active:bg-gray-200 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Next week"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-full md:w-auto px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white min-h-[44px]"
        >
          <option value="all">All Session Types</option>
          {allTypes.map((st) => (
            <option key={st.id} value={st.id}>
              {st.name}
            </option>
          ))}
        </select>
      </div>

      {/* Day tabs (mobile) */}
      <div className="flex md:hidden gap-1 mb-4 overflow-x-auto pb-2 -mx-4 px-4">
        {weekDays.map((day) => {
          const isSelected = isSameDay(day, selectedDay);
          const dayIsToday = isToday(day);
          const daySessions = getSessionsForDay(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDay(day)}
              className={`flex flex-col items-center min-w-[52px] px-3 py-2 rounded-xl transition-colors ${
                isSelected
                  ? 'bg-ice-blue text-white'
                  : dayIsToday
                    ? 'bg-ice-blue/10 text-ice-blue'
                    : 'bg-frost text-navy'
              }`}
            >
              <span className="text-xs font-medium">{format(day, 'EEE')}</span>
              <span className="text-lg font-bold">{format(day, 'd')}</span>
              {daySessions.length > 0 && (
                <span
                  className={`text-[10px] ${
                    isSelected ? 'text-white/80' : 'text-gray-400'
                  }`}
                >
                  {daySessions.length} {daySessions.length === 1 ? 'session' : 'sessions'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mobile: sessions for selected day */}
      <div className="md:hidden">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-frost rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <h2 className="font-semibold text-navy mb-3">
              {isToday(selectedDay)
                ? 'Today'
                : format(selectedDay, 'EEEE, MMMM d')}
            </h2>
            {getSessionsForDay(selectedDay).length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>No sessions scheduled</p>
              </div>
            ) : (
              <div className="space-y-3">
                {getSessionsForDay(selectedDay).map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    sessionTypes={allTypes}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Desktop: full week grid */}
      <div className="hidden md:grid grid-cols-7 gap-3">
        {weekDays.map((day) => {
          const daySessions = getSessionsForDay(day);
          const dayIsToday = isToday(day);

          return (
            <div key={day.toISOString()} className="min-w-0">
              <div
                className={`text-center py-2 rounded-t-xl font-medium text-sm ${
                  dayIsToday
                    ? 'bg-ice-blue text-white'
                    : 'bg-frost text-navy'
                }`}
              >
                <div>{format(day, 'EEE')}</div>
                <div className="text-lg font-bold">{format(day, 'd')}</div>
              </div>
              <div className="space-y-2 mt-2">
                {loading ? (
                  <div className="h-20 bg-frost rounded-lg animate-pulse" />
                ) : daySessions.length === 0 ? (
                  <div className="text-center py-6 text-gray-300 text-xs">
                    No sessions
                  </div>
                ) : (
                  daySessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      sessionTypes={allTypes}
                      compact
                    />
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
