'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SuccessPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleActivate(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/verify-pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? 'Verification failed');
      }

      if (data.isPro) {
        localStorage.setItem('coldcraft_pro', 'true');
        localStorage.setItem('coldcraft_pro_email', email.trim().toLowerCase());
        setStatus('success');
        setTimeout(() => router.push('/?upgraded=1'), 1500);
      } else {
        setStatus('error');
        setErrorMsg(
          "We couldn't verify a Pro subscription for this email. Make sure you're using the email you checked out with."
        );
      }
    } catch (err: unknown) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl text-center">
          {/* Checkmark */}
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/15 border border-blue-500/30 mx-auto mb-6">
            <svg
              className="w-10 h-10 text-blue-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">
            You&apos;re now a ColdCraft Pro member!
          </h1>
          <p className="text-slate-400 mb-8">Unlimited cold emails, forever.</p>

          {/* Divider */}
          <div className="border-t border-slate-700 mb-8" />

          <p className="text-sm text-slate-300 mb-4 font-medium">
            Enter the email you used at checkout to activate your account.
          </p>

          <form onSubmit={handleActivate} className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />

            {status === 'error' && (
              <p className="text-red-400 text-sm text-left">{errorMsg}</p>
            )}

            {status === 'success' && (
              <p className="text-green-400 text-sm font-medium">
                Account activated! Redirecting you now...
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="w-full py-3 px-6 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-150 flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Verifying...
                </>
              ) : status === 'success' ? (
                'Activated!'
              ) : (
                'Activate My Account'
              )}
            </button>
          </form>

          <p className="text-slate-500 text-xs mt-6">
            Having trouble?{' '}
            <a
              href="mailto:support@coldcraft.ai"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Contact support
            </a>
          </p>
        </div>

        {/* Reassurance row */}
        <div className="flex items-center justify-center gap-6 mt-6 text-slate-500 text-xs">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                clipRule="evenodd"
              />
            </svg>
            Secured by Stripe
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clipRule="evenodd"
              />
            </svg>
            No subscription — one-time setup
          </span>
        </div>
      </div>
    </div>
  );
}
