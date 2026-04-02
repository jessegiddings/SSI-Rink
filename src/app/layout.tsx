import type { Metadata, Viewport } from 'next';
import './globals.css';
import { BottomNav } from '@/components/bottom-nav';
import { TopNav } from '@/components/top-nav';

export const metadata: Metadata = {
  title: 'SSI Ice Rink — Salt Spring Island Community Ice Rink',
  description:
    'Book skating sessions, purchase season passes, and reserve private rentals at the Salt Spring Island Community Ice Rink.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SSI Ice Rink',
  },
};

export const viewport: Viewport = {
  themeColor: '#0A1628',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased font-sans">
        <TopNav />
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
