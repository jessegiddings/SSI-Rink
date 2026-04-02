import Link from 'next/link';
import { Check, Snowflake } from 'lucide-react';

export const metadata = {
  title: 'Season Passes — SSI Ice Rink',
  description: 'Purchase season passes for unlimited skating at Salt Spring Island Community Ice Rink.',
};

const passes = [
  {
    name: 'Individual Pass',
    price: '$75',
    period: 'per season',
    features: [
      'Unlimited open skate sessions',
      'Priority booking',
      'Skip the line at check-in',
      'Digital pass with QR code',
      '10% off private rentals',
    ],
  },
  {
    name: 'Family Pass',
    price: '$150',
    period: 'per season',
    popular: true,
    features: [
      'Unlimited skating for the whole family',
      'All open skate and family skate sessions',
      'Priority booking for all members',
      'Skip the line at check-in',
      'Digital passes with QR codes',
      '15% off private rentals and parties',
    ],
  },
];

export default function PassesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <Snowflake className="w-10 h-10 text-ice-blue mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-navy">Season Passes</h1>
        <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
          Skate all season long with unlimited access to open skate sessions.
          The best value for regular skaters.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {passes.map((pass) => (
          <div
            key={pass.name}
            className={`rounded-2xl p-6 ${
              pass.popular
                ? 'bg-navy text-white ring-2 ring-gold'
                : 'bg-white shadow-sm border border-gray-100'
            }`}
          >
            {pass.popular && (
              <span className="inline-block text-xs font-bold bg-gold text-navy px-3 py-1 rounded-full mb-3">
                BEST VALUE
              </span>
            )}
            <h2 className={`text-lg font-bold ${pass.popular ? 'text-white' : 'text-navy'}`}>
              {pass.name}
            </h2>
            <div className="mt-2">
              <span className={`text-4xl font-bold ${pass.popular ? 'text-gold' : 'text-ice-blue'}`}>
                {pass.price}
              </span>
              <span className={`text-sm ml-1 ${pass.popular ? 'text-white/60' : 'text-gray-400'}`}>
                {pass.period}
              </span>
            </div>
            <ul className="mt-5 space-y-3">
              {pass.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check className={`w-4 h-4 mt-0.5 shrink-0 ${pass.popular ? 'text-gold' : 'text-green'}`} />
                  <span className={pass.popular ? 'text-white/80' : 'text-gray-600'}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/login?redirect=/passes/checkout"
              className={`block w-full text-center font-semibold py-3 rounded-xl mt-6 min-h-[44px] transition-colors ${
                pass.popular
                  ? 'bg-gold text-navy hover:bg-gold/90'
                  : 'bg-ice-blue text-white hover:bg-ice-blue-dark'
              }`}
            >
              Get {pass.name}
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-400">
          Season passes require an account. You&apos;ll be asked to sign in or
          create an account before purchase.
        </p>
      </div>
    </div>
  );
}
