'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Ticket, Lock, User } from 'lucide-react';

const navItems = [
  { href: '/schedule', label: 'Schedule', icon: Calendar },
  { href: '/passes', label: 'Passes', icon: Ticket },
  { href: '/private', label: 'Rentals', icon: Lock },
  { href: '/account', label: 'Account', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] px-2 py-1 rounded-lg transition-colors ${
                isActive
                  ? 'text-ice-blue'
                  : 'text-gray-500 active:text-ice-blue'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs mt-0.5 font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
