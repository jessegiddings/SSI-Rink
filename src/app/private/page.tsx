import { Lock, Clock, Users, PartyPopper } from 'lucide-react';

export const metadata = {
  title: 'Private Rentals — SSI Ice Rink',
  description: 'Book private ice rink rentals and birthday parties at Salt Spring Island Community Ice Rink.',
};

const packages = [
  {
    icon: Clock,
    name: '1-Hour Rental',
    price: '$150',
    description: 'One hour of exclusive rink time for your group.',
    features: ['Exclusive rink access', 'Up to 25 guests', 'Skate rentals included'],
  },
  {
    icon: Users,
    name: '2-Hour Rental',
    price: '$200',
    description: 'Two hours of exclusive rink time — perfect for team events.',
    features: ['Exclusive rink access', 'Up to 30 guests', 'Skate rentals included', 'Setup time included'],
  },
  {
    icon: PartyPopper,
    name: 'Birthday Party',
    price: 'From $250',
    popular: true,
    description: 'The ultimate birthday experience on ice!',
    features: [
      '2 hours exclusive rink time',
      'Up to 20 kids + parents',
      'Party area setup',
      'Skate rentals for all guests',
      'Clean-up included',
    ],
  },
];

export default function PrivatePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <Lock className="w-10 h-10 text-gold mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-navy">Private Rentals</h1>
        <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
          Book the rink exclusively for your group. Perfect for team events,
          birthday parties, and private gatherings.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {packages.map((pkg) => (
          <div
            key={pkg.name}
            className={`rounded-2xl p-5 ${
              pkg.popular
                ? 'bg-navy text-white ring-2 ring-pink'
                : 'bg-white shadow-sm border border-gray-100'
            }`}
          >
            {pkg.popular && (
              <span className="inline-block text-xs font-bold bg-pink text-white px-3 py-1 rounded-full mb-3">
                POPULAR
              </span>
            )}
            <pkg.icon className={`w-8 h-8 mb-3 ${pkg.popular ? 'text-pink' : 'text-gold'}`} />
            <h3 className={`font-bold text-lg ${pkg.popular ? 'text-white' : 'text-navy'}`}>
              {pkg.name}
            </h3>
            <div className={`text-2xl font-bold mt-1 ${pkg.popular ? 'text-gold' : 'text-ice-blue'}`}>
              {pkg.price}
            </div>
            <p className={`text-sm mt-2 ${pkg.popular ? 'text-white/70' : 'text-gray-500'}`}>
              {pkg.description}
            </p>
            <ul className="mt-4 space-y-2">
              {pkg.features.map((f) => (
                <li key={f} className={`text-xs flex items-center gap-1.5 ${pkg.popular ? 'text-white/80' : 'text-gray-600'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${pkg.popular ? 'bg-pink' : 'bg-gold'}`} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Contact form placeholder */}
      <div className="bg-white rounded-2xl p-6 shadow-sm max-w-lg mx-auto">
        <h2 className="font-bold text-navy text-lg mb-1">Request a Booking</h2>
        <p className="text-gray-500 text-sm mb-4">
          Fill out the form below and we&apos;ll get back to you within 24 hours.
          A 50% deposit is required to confirm your booking.
        </p>
        <form className="space-y-3">
          <input
            type="text"
            placeholder="Your name"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 min-h-[44px]"
          />
          <input
            type="email"
            placeholder="Email address"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 min-h-[44px]"
          />
          <input
            type="tel"
            placeholder="Phone number"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 min-h-[44px]"
          />
          <select className="w-full px-4 py-3 rounded-xl border border-gray-200 min-h-[44px] text-gray-500">
            <option>Select a package...</option>
            <option value="1hr">1-Hour Rental ($150)</option>
            <option value="2hr">2-Hour Rental ($200)</option>
            <option value="birthday">Birthday Party (From $250)</option>
          </select>
          <input
            type="date"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 min-h-[44px]"
          />
          <input
            type="number"
            placeholder="Number of guests"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 min-h-[44px]"
          />
          <textarea
            placeholder="Special requests or notes..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200"
          />
          <button
            type="submit"
            className="w-full bg-ice-blue text-white font-semibold py-3 rounded-xl min-h-[44px] hover:bg-ice-blue-dark transition-colors"
          >
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
}
