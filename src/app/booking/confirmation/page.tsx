'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, Calendar, Clock, Users, MapPin, ArrowRight } from 'lucide-react';

interface BookingData {
  id: string;
  guest_name: string;
  guest_email: string;
  num_adults: number;
  num_children: number;
  is_family: boolean;
  total_price: number;
  payment_status: string;
  qr_code: string;
  session?: {
    date: string;
    start_time: string;
    end_time: string;
    session_type?: {
      name: string;
      color_hex: string;
    };
  };
  session_type?: {
    name: string;
    color_hex: string;
  };
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  return minutes === 0
    ? `${displayHour} ${period}`
    : `${displayHour}:${String(minutes).padStart(2, '0')} ${period}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const bookingId = searchParams.get('id');
    const checkoutSessionId = searchParams.get('checkout_session_id');

    if (bookingId) {
      fetchBooking(bookingId);
    } else if (checkoutSessionId) {
      fetchBookingByCheckout(checkoutSessionId);
    } else {
      setError('No booking information provided.');
      setLoading(false);
    }
  }, [searchParams]);

  async function fetchBooking(id: string) {
    // Check sessionStorage first (demo mode / just-created bookings)
    const stored = sessionStorage.getItem(`booking_${id}`);
    if (stored) {
      try {
        setBooking(JSON.parse(stored));
        setLoading(false);
        return;
      } catch {
        // Fall through to API
      }
    }

    try {
      const res = await fetch(`/api/bookings/${id}`);
      if (res.ok) {
        setBooking(await res.json());
      } else {
        setError('Booking not found.');
      }
    } catch {
      setError('Failed to load booking details.');
    }
    setLoading(false);
  }

  async function fetchBookingByCheckout(checkoutSessionId: string) {
    try {
      const res = await fetch(`/api/bookings/by-checkout?session_id=${checkoutSessionId}`);
      if (res.ok) {
        setBooking(await res.json());
      } else {
        // Webhook may not have processed yet — show success anyway
        setBooking(null);
        setError('');
      }
    } catch {
      setError('');
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="space-y-4">
          <div className="h-16 w-16 bg-frost rounded-full animate-pulse mx-auto" />
          <div className="h-6 w-48 bg-frost rounded animate-pulse mx-auto" />
          <div className="h-4 w-64 bg-frost rounded animate-pulse mx-auto" />
        </div>
      </div>
    );
  }

  const sessionType = booking?.session?.session_type || booking?.session_type;

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Success header */}
      <div className="text-center mb-6">
        <div className="bg-green/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green" />
        </div>
        <h1 className="text-2xl font-bold text-navy">
          {booking ? 'Booking Confirmed!' : 'Payment Received!'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {booking
            ? `A confirmation email has been sent to ${booking.guest_email}`
            : 'Your booking is being processed. You will receive a confirmation email shortly.'}
        </p>
      </div>

      {error && !booking && (
        <div className="bg-red/10 text-red rounded-xl p-4 text-center text-sm mb-6">
          {error}
        </div>
      )}

      {booking && (
        <>
          {/* Booking details card */}
          <div
            className="rounded-xl overflow-hidden shadow-sm mb-6"
            style={{
              borderTop: `4px solid ${sessionType?.color_hex || '#00A3E0'}`,
            }}
          >
            <div className="bg-white p-5">
              <h2
                className="font-bold text-lg mb-3"
                style={{ color: sessionType?.color_hex || '#0A1628' }}
              >
                {sessionType?.name || 'Skating Session'}
              </h2>

              <div className="space-y-2 text-sm text-gray-600">
                {booking.session?.date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{formatDate(booking.session.date)}</span>
                  </div>
                )}
                {booking.session?.start_time && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>
                      {formatTime(booking.session.start_time)} —{' '}
                      {formatTime(booking.session.end_time)}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>
                    {booking.is_family
                      ? 'Family booking'
                      : [
                          booking.num_adults > 0 &&
                            `${booking.num_adults} adult${booking.num_adults !== 1 ? 's' : ''}`,
                          booking.num_children > 0 &&
                            `${booking.num_children} child${booking.num_children !== 1 ? 'ren' : ''}`,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>Salt Spring Island Community Ice Rink</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-gray-500 text-sm">Total paid</span>
                <span className="text-xl font-bold text-navy">
                  {booking.total_price === 0
                    ? 'Free'
                    : `$${booking.total_price.toFixed(2)} CAD`}
                </span>
              </div>
            </div>
          </div>

          {/* QR Code */}
          {booking.qr_code && (
            <div className="bg-white rounded-xl p-6 shadow-sm text-center mb-6">
              <p className="text-sm text-gray-500 mb-3">
                Show this QR code at check-in
              </p>
              <Image
                src={booking.qr_code}
                alt="Booking QR Code"
                width={200}
                height={200}
                className="mx-auto"
              />
              <p className="text-xs text-gray-400 mt-3 font-mono">
                Booking ID: {booking.id.slice(0, 8)}...
              </p>
            </div>
          )}

          {/* What to bring */}
          <div className="bg-frost rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-navy text-sm mb-2">
              What to bring
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>- Warm clothing and gloves</li>
              <li>- This QR code on your phone</li>
              <li>- Skate rentals and helmets are included</li>
            </ul>
          </div>
        </>
      )}

      {/* Actions */}
      <div className="space-y-3">
        <Link
          href="/schedule"
          className="block w-full bg-ice-blue text-white font-semibold py-3 rounded-xl text-center min-h-[44px] hover:bg-ice-blue-dark transition-colors"
        >
          <span className="flex items-center justify-center gap-2">
            Back to Schedule <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
        <Link
          href="/"
          className="block w-full bg-frost text-navy font-medium py-3 rounded-xl text-center min-h-[44px] hover:bg-gray-200 transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
