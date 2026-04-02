import Link from 'next/link';
import { ArrowLeft, Clock, Users, MapPin } from 'lucide-react';
import { getSession, getSessionTypes } from '@/lib/data';
import { formatTime, getSessionPrice, getSessionTypeForSession } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { BookingForm } from '@/components/booking/booking-form';

interface BookPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function BookPage({ params }: BookPageProps) {
  const { sessionId } = await params;
  const [session, sessionTypes] = await Promise.all([
    getSession(sessionId),
    getSessionTypes(),
  ]);

  if (!session) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-navy mb-2">Session not found</h1>
        <p className="text-gray-500 mb-6">
          This session may have been removed or the link is invalid.
        </p>
        <Link href="/schedule" className="text-ice-blue font-medium hover:underline">
          Back to schedule
        </Link>
      </div>
    );
  }

  const sessionType = getSessionTypeForSession(session, sessionTypes);
  if (!sessionType) return null;

  const isFull = session.status === 'full' || session.spots_remaining === 0;
  const isCancelled = session.status === 'cancelled';
  const price = getSessionPrice(session, sessionType);

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <Link
        href="/schedule"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-navy mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to schedule
      </Link>

      {/* Session details */}
      <div
        className="rounded-xl p-5 mb-6 border-l-4"
        style={{ borderLeftColor: sessionType.color_hex, backgroundColor: `${sessionType.color_hex}10` }}
      >
        <h1 className="text-xl font-bold text-navy">{sessionType.name}</h1>
        <div className="mt-3 space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>
              {format(parseISO(session.date), 'EEEE, MMMM d, yyyy')} &middot;{' '}
              {formatTime(session.start_time)} — {formatTime(session.end_time)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span>
              {session.spots_remaining} of {session.capacity} spots available
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>Salt Spring Island Community Ice Rink</span>
          </div>
        </div>
        {sessionType.description && (
          <p className="text-sm text-gray-500 mt-3">{sessionType.description}</p>
        )}
      </div>

      {isCancelled ? (
        <div className="bg-red/10 text-red rounded-xl p-4 text-center font-medium">
          This session has been cancelled.
        </div>
      ) : isFull ? (
        <div className="bg-gray-100 text-gray-500 rounded-xl p-4 text-center font-medium">
          This session is full. Check the schedule for other available times.
        </div>
      ) : (
        <BookingForm
          session={session}
          sessionType={sessionType}
        />
      )}
    </div>
  );
}
