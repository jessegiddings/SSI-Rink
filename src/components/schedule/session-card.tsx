import Link from 'next/link';
import { Clock, Users } from 'lucide-react';
import { Session, SessionType } from '@/lib/types';
import { formatTime, getSessionPrice, getSessionTypeForSession } from '@/lib/utils';

interface SessionCardProps {
  session: Session;
  sessionTypes: SessionType[];
  compact?: boolean;
}

export function SessionCard({ session, sessionTypes, compact }: SessionCardProps) {
  const sessionType = getSessionTypeForSession(session, sessionTypes);
  if (!sessionType) return null;

  const isFull = session.status === 'full' || session.spots_remaining === 0;
  const isCancelled = session.status === 'cancelled';
  const isLowSpots = session.spots_remaining > 0 && session.spots_remaining <= 3;
  const price = getSessionPrice(session, sessionType);

  const content = compact ? (
    // Desktop compact card
    <div
      className={`rounded-lg p-2.5 border-l-4 transition-all ${
        isCancelled
          ? 'bg-gray-100 border-gray-300 opacity-60 line-through'
          : isFull
            ? 'bg-gray-100 border-gray-300 opacity-70'
            : 'bg-white shadow-sm hover:shadow-md cursor-pointer'
      }`}
      style={{
        borderLeftColor: isCancelled || isFull ? undefined : sessionType.color_hex,
      }}
    >
      <div className="text-xs font-semibold truncate" style={{ color: sessionType.color_hex }}>
        {sessionType.name}
      </div>
      <div className="text-xs text-gray-600 mt-0.5">
        {formatTime(session.start_time)}
      </div>
      {isFull ? (
        <div className="text-xs font-bold text-red mt-1">FULL</div>
      ) : isCancelled ? (
        <div className="text-xs font-bold text-gray-400 mt-1">CANCELLED</div>
      ) : (
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500">
            {session.spots_remaining} left
          </span>
          {price && <span className="text-xs font-semibold text-navy">{price}</span>}
        </div>
      )}
    </div>
  ) : (
    // Mobile full card
    <div
      className={`rounded-xl p-4 border-l-4 transition-all ${
        isCancelled
          ? 'bg-gray-100 border-gray-300 opacity-60'
          : isFull
            ? 'bg-gray-50 border-gray-300'
            : 'bg-white shadow-sm hover:shadow-md'
      }`}
      style={{
        borderLeftColor: isCancelled || isFull ? undefined : sessionType.color_hex,
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div
            className={`font-semibold ${isCancelled ? 'line-through text-gray-400' : ''}`}
            style={{ color: isCancelled ? undefined : sessionType.color_hex }}
          >
            {sessionType.name}
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatTime(session.start_time)} — {formatTime(session.end_time)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {isFull ? (
                <span className="text-red font-medium">Full</span>
              ) : (
                <span className={isLowSpots ? 'text-orange font-medium' : ''}>
                  {session.spots_remaining}/{session.capacity}
                </span>
              )}
            </span>
          </div>
        </div>
        <div className="text-right">
          {isCancelled ? (
            <span className="text-sm font-bold text-gray-400">CANCELLED</span>
          ) : isFull ? (
            <span className="text-sm font-bold text-red">FULL</span>
          ) : (
            <>
              {price && (
                <div className="text-lg font-bold text-navy">{price}</div>
              )}
              <div className="text-xs text-ice-blue font-medium mt-0.5">
                Book now
              </div>
            </>
          )}
        </div>
      </div>
      {isLowSpots && !isFull && !isCancelled && (
        <div className="mt-2 text-xs font-medium text-orange bg-orange/10 px-2 py-1 rounded-md inline-block">
          Only {session.spots_remaining} spot{session.spots_remaining !== 1 ? 's' : ''} left!
        </div>
      )}
    </div>
  );

  if (isFull || isCancelled) {
    return content;
  }

  return (
    <Link href={`/book/${session.id}`} className="block">
      {content}
    </Link>
  );
}
