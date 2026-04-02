import Link from 'next/link';
import { Calendar, Settings, Plus } from 'lucide-react';

export const metadata = {
  title: 'Admin Dashboard — SSI Ice Rink',
};

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Admin Dashboard</h1>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link
          href="/admin/schedule"
          className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <Calendar className="w-8 h-8 text-ice-blue mb-2" />
          <h3 className="font-bold text-navy">Schedule Builder</h3>
          <p className="text-gray-500 text-sm mt-1">
            Create and manage skating sessions
          </p>
        </Link>

        <Link
          href="/admin/session-types"
          className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <Settings className="w-8 h-8 text-gold mb-2" />
          <h3 className="font-bold text-navy">Session Types</h3>
          <p className="text-gray-500 text-sm mt-1">
            Manage session types, pricing, and colors
          </p>
        </Link>

        <Link
          href="/admin/schedule?action=create"
          className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <Plus className="w-8 h-8 text-green mb-2" />
          <h3 className="font-bold text-navy">Quick Create</h3>
          <p className="text-gray-500 text-sm mt-1">
            Add a new session to the schedule
          </p>
        </Link>
      </div>

      {/* Placeholder stats */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="font-bold text-navy mb-4">Overview</h2>
        <p className="text-gray-500 text-sm">
          Connect Supabase to see live booking statistics, revenue summaries, and
          today&apos;s session details. Set up your environment variables to get
          started.
        </p>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Today's Sessions", value: '—' },
            { label: 'Active Bookings', value: '—' },
            { label: 'Revenue (This Week)', value: '—' },
            { label: 'Season Passes', value: '—' },
          ].map((stat) => (
            <div key={stat.label} className="bg-frost rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-navy">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
