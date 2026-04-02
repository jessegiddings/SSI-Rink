import Link from 'next/link';
import { User, Ticket, Calendar, LogOut } from 'lucide-react';

export const metadata = {
  title: 'My Account — SSI Ice Rink',
};

export default function AccountPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-navy mb-6">My Account</h1>

      <div className="space-y-4">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-ice-blue/10 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-ice-blue" />
            </div>
            <div>
              <div className="font-semibold text-navy">Welcome</div>
              <div className="text-sm text-gray-500">Manage your bookings and passes</div>
            </div>
          </div>
        </div>

        <Link
          href="/account"
          className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow"
        >
          <Calendar className="w-5 h-5 text-ice-blue" />
          <div className="flex-1">
            <div className="font-medium text-navy">My Bookings</div>
            <div className="text-sm text-gray-400">View upcoming and past bookings</div>
          </div>
        </Link>

        <Link
          href="/account"
          className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow"
        >
          <Ticket className="w-5 h-5 text-gold" />
          <div className="flex-1">
            <div className="font-medium text-navy">Season Pass</div>
            <div className="text-sm text-gray-400">View your pass and QR code</div>
          </div>
        </Link>

        <button className="w-full bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow text-left">
          <LogOut className="w-5 h-5 text-red" />
          <div className="font-medium text-red">Sign Out</div>
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center mt-8">
        Account features will be fully functional once Supabase Auth is connected.
      </p>
    </div>
  );
}
