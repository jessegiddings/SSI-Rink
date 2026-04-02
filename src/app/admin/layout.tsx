import Link from 'next/link';
import { LayoutDashboard, Calendar, Settings, Snowflake } from 'lucide-react';

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/schedule', label: 'Schedule Builder', icon: Calendar },
  { href: '/admin/session-types', label: 'Session Types', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-frost">
      {/* Admin header (always visible, even on mobile) */}
      <div className="bg-navy text-white px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <Snowflake className="w-5 h-5 text-ice-blue" />
          <span className="font-bold text-sm">SSI Ice Rink — Admin</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:block w-56 shrink-0 p-4">
          <div className="sticky top-20">
            <div className="flex items-center gap-2 mb-6 px-3">
              <Snowflake className="w-5 h-5 text-ice-blue" />
              <span className="font-bold text-navy text-sm">Admin Panel</span>
            </div>
            <nav className="space-y-1">
              {adminLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-white hover:text-navy transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Mobile nav */}
        <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 z-40 flex">
          {adminLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center py-2 text-gray-500 hover:text-ice-blue"
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{label}</span>
            </Link>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 md:p-6 min-w-0 pb-36 md:pb-6">{children}</div>
      </div>
    </div>
  );
}
