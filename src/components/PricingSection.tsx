'use client';

import { useState } from 'react';
import UpgradeModal from './UpgradeModal';

export default function PricingSection() {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [initialPlan, setInitialPlan] = useState<'monthly' | 'yearly'>('yearly');

  function open(plan: 'monthly' | 'yearly') {
    setInitialPlan(plan);
    setShowUpgrade(true);
  }

  return (
    <>
      <div className="grid sm:grid-cols-2 gap-4 max-w-xl mx-auto">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 text-left flex flex-col">
          <div className="text-slate-400 text-sm mb-1">Monthly</div>
          <div className="text-3xl font-semibold text-white mb-1">€19</div>
          <div className="text-slate-500 text-sm mb-4">per month</div>
          <ul className="space-y-2 text-sm text-slate-400 mb-6 flex-1">
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Unlimited emails</li>
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> All 3 frameworks</li>
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> All tones &amp; lengths</li>
          </ul>
          <button
            onClick={() => open('monthly')}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-700 active:scale-95"
          >
            Get Pro Monthly
          </button>
        </div>

        <div className="bg-slate-900 border-2 border-blue-500 rounded-xl p-6 text-left relative flex flex-col">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-medium px-3 py-0.5 rounded-full">
            Best value
          </div>
          <div className="text-slate-400 text-sm mb-1">Yearly</div>
          <div className="text-3xl font-semibold text-white mb-1">€149</div>
          <div className="text-slate-500 text-sm mb-4">
            per year{' '}
            <span className="text-green-400 font-medium">save 34%</span>
          </div>
          <ul className="space-y-2 text-sm text-slate-400 mb-6 flex-1">
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Unlimited emails</li>
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> All 3 frameworks</li>
            <li className="flex items-center gap-2"><span className="text-green-500">✓</span> All tones &amp; lengths</li>
          </ul>
          <button
            onClick={() => open('yearly')}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-500 active:scale-95"
          >
            Get Pro Yearly →
          </button>
        </div>
      </div>

      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} initialPlan={initialPlan} />
    </>
  );
}
