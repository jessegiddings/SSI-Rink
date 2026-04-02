import { Suspense } from 'react';

export default function ConfirmationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="space-y-4">
            <div className="h-16 w-16 bg-frost rounded-full animate-pulse mx-auto" />
            <div className="h-6 w-48 bg-frost rounded animate-pulse mx-auto" />
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
