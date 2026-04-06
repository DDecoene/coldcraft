'use client';

import { useState, useEffect } from 'react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: 'monthly' | 'yearly';
}

type Plan = 'monthly' | 'yearly';

export default function UpgradeModal({ isOpen, onClose, initialPlan = 'yearly' }: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<Plan>(initialPlan);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill email from localStorage if available
  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem('coldcraft_pro_email') ?? '';
      setEmail(stored);
      setError('');
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function handleUpgrade() {
    if (!email.trim()) {
      setError('Please enter your email address to continue.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), plan: selectedPlan }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600/20 to-slate-900 px-6 pt-8 pb-6 text-center border-b border-slate-700">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/30 mb-4">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Upgrade to ColdCraft Pro</h2>
          <p className="text-slate-400 text-sm">
            You&apos;ve used your <span className="text-white font-medium">3 free emails</span> today.
            Unlock unlimited cold emails.
          </p>
        </div>

        {/* Plan cards */}
        <div className="px-6 pt-6 space-y-3">
          {/* Yearly plan */}
          <button
            type="button"
            onClick={() => setSelectedPlan('yearly')}
            className={`relative w-full text-left rounded-xl border-2 p-4 transition-all duration-150 ${
              selectedPlan === 'yearly'
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-slate-700 bg-slate-800 hover:border-slate-600'
            }`}
          >
            {/* Best value badge */}
            <span className="absolute -top-2.5 left-4 text-xs font-bold bg-blue-500 text-white px-2 py-0.5 rounded-full">
              BEST VALUE — SAVE 26%
            </span>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white text-sm">Yearly</p>
                <p className="text-slate-400 text-xs mt-0.5">Billed once per year</p>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-lg">€79<span className="text-slate-400 font-normal text-sm">/yr</span></p>
                <p className="text-slate-400 text-xs">€6.58/mo</p>
              </div>
            </div>
            {selectedPlan === 'yearly' && (
              <div className="absolute top-1/2 -translate-y-1/2 right-4">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </button>

          {/* Monthly plan */}
          <button
            type="button"
            onClick={() => setSelectedPlan('monthly')}
            className={`w-full text-left rounded-xl border-2 p-4 transition-all duration-150 ${
              selectedPlan === 'monthly'
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-slate-700 bg-slate-800 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white text-sm">Monthly</p>
                <p className="text-slate-400 text-xs mt-0.5">Billed every month</p>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-lg">€9<span className="text-slate-400 font-normal text-sm">/mo</span></p>
              </div>
            </div>
            {selectedPlan === 'monthly' && (
              <div className="absolute top-1/2 -translate-y-1/2 right-4 pointer-events-none">
                {/* checkmark handled by border color */}
              </div>
            )}
          </button>
        </div>

        {/* Email + CTA */}
        <div className="px-6 pb-6 pt-4 space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            placeholder="your@email.com"
            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="button"
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full py-3 px-6 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-150 flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Redirecting to checkout...
              </>
            ) : (
              <>
                Upgrade Now
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </>
            )}
          </button>

          <p className="text-slate-500 text-xs text-center">
            Secured by Stripe &bull; Cancel anytime &bull; Instant access
          </p>
        </div>
      </div>
    </div>
  );
}
