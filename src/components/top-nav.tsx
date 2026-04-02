'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Ticket, Lock, User, Snowflake } from 'lucide-react';

const navLinks = [
  { href: '/schedule', label: 'Schedule', icon: Calendar },
  { href: '/passes', label: 'Passes', icon: Ticket },
  { href: '/private', label: 'Private Rentals', icon: Lock },
  { href: '/account', label: 'Account', icon: User },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="hidden md:block bg-navy text-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Snowflake className="w-6 h-6 text-ice-blue" />
          <span>SSI Ice Rink</span>
        </Link>
        <nav className="flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-ice-blue/20 text-ice-blue'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
