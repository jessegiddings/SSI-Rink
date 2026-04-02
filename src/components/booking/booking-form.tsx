'use client';

import { useState, useMemo } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Session, SessionType } from '@/lib/types';

interface BookingFormProps {
  session: Session;
  sessionType: SessionType;
}

export function BookingForm({ session, sessionType }: BookingFormProps) {
  const [numAdults, setNumAdults] = useState(1);
  const [numChildren, setNumChildren] = useState(0);
  const [isFamily, setIsFamily] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const adultPrice = session.price_override_adult ?? sessionType.default_price_adult ?? 0;
  const childPrice = session.price_override_child ?? sessionType.default_price_child ?? 0;
  const familyPrice = session.price_override_family ?? sessionType.default_price_family;

  const totalPeople = numAdults + numChildren;
  const isFamilyOnly = familyPrice !== null && adultPrice === 0 && childPrice === 0;

  const totalPrice = useMemo(() => {
    if (isFamilyOnly && familyPrice !== null) return familyPrice;
    if (isFamily && familyPrice !== null) return familyPrice;
    return numAdults * adultPrice + numChildren * childPrice;
  }, [numAdults, numChildren, isFamily, adultPrice, childPrice, familyPrice, isFamilyOnly]);

  const isFree = totalPrice === 0;

  function adjustCount(
    setter: (fn: (prev: number) => number) => void,
    delta: number,
    min: number = 0
  ) {
    setter((prev) => {
      const next = prev + delta;
      if (next < min) return min;
      if (totalPeople + delta > session.spots_remaining && delta > 0) return prev;
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (isFree) {
      // For free sessions, create booking directly
      try {
        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: session.id,
            guest_name: guestName,
            guest_email: guestEmail,
            num_adults: numAdults,
            num_children: numChildren,
            is_family: isFamily || isFamilyOnly,
            total_price: 0,
          }),
        });
        if (res.ok) {
          const booking = await res.json();
          window.location.href = `/booking/confirmation?id=${booking.id}`;
        }
      } catch {
        // Handle error
      }
      setLoading(false);
      return;
    }

    // For paid sessions, redirect to Stripe
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.id,
          guest_name: guestName,
          guest_email: guestEmail,
          num_adults: numAdults,
          num_children: numChildren,
          is_family: isFamily || isFamilyOnly,
          total_price: totalPrice,
        }),
      });
      if (res.ok) {
        const { url } = await res.json();
        window.location.href = url;
      }
    } catch {
      // Handle error
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Ticket selector */}
      <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
        <h2 className="font-bold text-navy">Select Tickets</h2>

        {!isFamilyOnly && (
          <>
            {/* Adults */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-navy">Adults</div>
                <div className="text-sm text-gray-500">${adultPrice.toFixed(2)} each</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => adjustCount(setNumAdults, -1, 0)}
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-frost"
                  disabled={numAdults === 0}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-bold text-lg">{numAdults}</span>
                <button
                  type="button"
                  onClick={() => adjustCount(setNumAdults, 1)}
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-frost"
                  disabled={totalPeople >= session.spots_remaining}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Children */}
            {childPrice !== null && (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-navy">Children (under 12)</div>
                  <div className="text-sm text-gray-500">${childPrice.toFixed(2)} each</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => adjustCount(setNumChildren, -1)}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-frost"
                    disabled={numChildren === 0}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-bold text-lg">{numChildren}</span>
                  <button
                    type="button"
                    onClick={() => adjustCount(setNumChildren, 1)}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-frost"
                    disabled={totalPeople >= session.spots_remaining}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Family toggle */}
            {familyPrice !== null && (
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div>
                  <div className="font-medium text-navy">Book as Family</div>
                  <div className="text-sm text-gray-500">
                    ${familyPrice.toFixed(2)} — any number of family members
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFamily(!isFamily)}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    isFamily ? 'bg-ice-blue' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform shadow-sm ${
                      isFamily ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>
            )}
          </>
        )}

        {isFamilyOnly && (
          <div className="text-center py-2">
            <div className="text-2xl font-bold text-ice-blue">
              {familyPrice === 0 ? 'Free' : `$${familyPrice!.toFixed(2)}`}
            </div>
            <div className="text-sm text-gray-500">per family</div>
          </div>
        )}

        {/* Price summary */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="font-medium text-gray-600">Total</span>
          <span className="text-2xl font-bold text-navy">
            {isFree ? 'Free' : `$${totalPrice.toFixed(2)}`}
          </span>
        </div>
      </div>

      {/* Guest info */}
      <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
        <h2 className="font-bold text-navy">Your Information</h2>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-600 mb-1">
            Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Your name"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ice-blue min-h-[44px]"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ice-blue min-h-[44px]"
          />
        </div>
        <p className="text-xs text-gray-400">
          We&apos;ll send your booking confirmation and QR code to this email.
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || (totalPeople === 0 && !isFamilyOnly)}
        className="w-full bg-ice-blue text-white font-bold py-4 rounded-xl min-h-[44px] text-lg hover:bg-ice-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : isFree ? 'Book Now — Free' : `Pay $${totalPrice.toFixed(2)}`}
      </button>

      <p className="text-xs text-gray-400 text-center">
        {isFree
          ? 'No payment required. You will receive a confirmation email.'
          : 'You will be redirected to Stripe for secure payment.'}
      </p>
    </form>
  );
}
