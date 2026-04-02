import { Suspense } from 'react';
import { ScheduleView } from '@/components/schedule/schedule-view';
import { getSessionTypes } from '@/lib/data';

export const metadata = {
  title: 'Schedule — SSI Ice Rink',
  description: 'View the weekly skating schedule at Salt Spring Island Community Ice Rink.',
};

export default async function SchedulePage() {
  const sessionTypes = await getSessionTypes();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-navy mb-1">Rink Schedule</h1>
      <p className="text-gray-500 text-sm mb-6">
        Tap any session to view details and book
      </p>
      <Suspense
        fallback={
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-frost rounded-xl animate-pulse" />
            ))}
          </div>
        }
      >
        <ScheduleView sessionTypes={sessionTypes} />
      </Suspense>
    </div>
  );
}
