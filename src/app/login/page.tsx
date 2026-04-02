'use client';

import { useState } from 'react';
import { Snowflake, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    }

    setLoading(false);
  }

  if (sent) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-green/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-green" />
        </div>
        <h1 className="text-2xl font-bold text-navy mb-2">Check your email</h1>
        <p className="text-gray-500">
          We sent a magic link to <strong>{email}</strong>. Click the link in the
          email to sign in.
        </p>
        <button
          onClick={() => {
            setSent(false);
            setEmail('');
          }}
          className="text-ice-blue text-sm font-medium mt-6 hover:underline"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-navy mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to home
      </Link>

      <div className="flex items-center gap-2 mb-2">
        <Snowflake className="w-6 h-6 text-ice-blue" />
        <h1 className="text-2xl font-bold text-navy">Sign in</h1>
      </div>
      <p className="text-gray-500 text-sm mb-8">
        Enter your email and we&apos;ll send you a magic link to sign in. No password needed.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-navy mb-1">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ice-blue focus:border-transparent min-h-[44px]"
          />
        </div>

        {error && (
          <div className="text-red text-sm bg-red/10 px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ice-blue text-white font-semibold py-3 rounded-xl min-h-[44px] hover:bg-ice-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : 'Send magic link'}
        </button>
      </form>

      <p className="text-xs text-gray-400 text-center mt-6">
        Accounts are only required for season passes. You can book regular
        sessions as a guest.
      </p>
    </div>
  );
}
