import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Ticket, Lock, ArrowRight } from 'lucide-react';
import { getUpcomingSessions, getSessionTypes } from '@/lib/data';
import { SessionCard } from '@/components/schedule/session-card';

export default async function HomePage() {
  const [upcomingSessions, sessionTypes] = await Promise.all([
    getUpcomingSessions(5),
    getSessionTypes(),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-navy text-white">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
          <div className="flex flex-col items-center md:flex-row md:items-center gap-6 mb-8">
            <Image
              src="/IMG_4398.png"
              alt="Salt Spring Island Community Arena Association"
              width={180}
              height={180}
              className="w-36 h-36 md:w-44 md:h-44"
              priority
            />
            <div>
              <h1 className="text-3xl md:text-5xl font-bold text-center md:text-left">
                Salt Spring Island
              </h1>
              <p className="text-ice-blue text-lg md:text-2xl font-semibold text-center md:text-left mt-1">
                Community Arena Association
              </p>
            </div>
          </div>
          <p className="text-white/70 text-lg md:text-xl max-w-xl mb-8 text-center md:text-left">
            Open skating, hockey, private rentals, and birthday parties for all ages.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/schedule"
              className="inline-flex items-center gap-2 bg-ice-blue text-white font-semibold px-6 py-3 rounded-xl min-h-[44px] hover:bg-ice-blue-dark transition-colors"
            >
              <Calendar className="w-5 h-5" />
              View Schedule
            </Link>
            <Link
              href="/passes"
              className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-6 py-3 rounded-xl min-h-[44px] hover:bg-white/20 transition-colors"
            >
              <Ticket className="w-5 h-5" />
              Season Passes
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Sessions */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-navy">Upcoming Sessions</h2>
          <Link
            href="/schedule"
            className="text-ice-blue text-sm font-medium flex items-center gap-1 hover:underline"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {upcomingSessions.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-frost rounded-xl">
            <p>No upcoming sessions scheduled yet.</p>
            <p className="text-sm mt-1">Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                sessionTypes={sessionTypes}
              />
            ))}
          </div>
        )}
      </section>

      {/* Quick Links */}
      <section className="max-w-6xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/passes"
            className="bg-frost rounded-xl p-6 hover:shadow-md transition-shadow group"
          >
            <Ticket className="w-8 h-8 text-gold mb-3" />
            <h3 className="font-bold text-navy text-lg">Season Passes</h3>
            <p className="text-gray-500 text-sm mt-1">
              Unlimited skating from $75. Individual and family options available.
            </p>
            <span className="text-ice-blue text-sm font-medium mt-3 inline-flex items-center gap-1 group-hover:underline">
              Learn more <ArrowRight className="w-3 h-3" />
            </span>
          </Link>

          <Link
            href="/private"
            className="bg-frost rounded-xl p-6 hover:shadow-md transition-shadow group"
          >
            <Lock className="w-8 h-8 text-gold mb-3" />
            <h3 className="font-bold text-navy text-lg">Private Rentals</h3>
            <p className="text-gray-500 text-sm mt-1">
              Book the rink exclusively for your group. Starting at $150/hour.
            </p>
            <span className="text-ice-blue text-sm font-medium mt-3 inline-flex items-center gap-1 group-hover:underline">
              Book a rental <ArrowRight className="w-3 h-3" />
            </span>
          </Link>

          <Link
            href="/schedule"
            className="bg-frost rounded-xl p-6 hover:shadow-md transition-shadow group"
          >
            <Calendar className="w-8 h-8 text-gold mb-3" />
            <h3 className="font-bold text-navy text-lg">Full Schedule</h3>
            <p className="text-gray-500 text-sm mt-1">
              View the full weekly schedule with all session types and availability.
            </p>
            <span className="text-ice-blue text-sm font-medium mt-3 inline-flex items-center gap-1 group-hover:underline">
              See schedule <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        </div>
      </section>

      {/* Pricing summary */}
      <section className="bg-frost">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-bold text-navy mb-6 text-center">
            Pricing
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Adult Skate', price: '$7', note: 'Includes rentals' },
              { label: 'Child Skate', price: '$5', note: 'Under 12' },
              { label: 'Family', price: '$20', note: 'Any size family' },
              { label: 'Season Pass', price: 'From $75', note: 'Unlimited skating' },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-xl p-4 text-center shadow-sm">
                <div className="text-2xl font-bold text-ice-blue">{item.price}</div>
                <div className="font-semibold text-navy text-sm mt-1">{item.label}</div>
                <div className="text-gray-400 text-xs mt-0.5">{item.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
