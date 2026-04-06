import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — ColdCraft',
  description: 'ColdCraft privacy policy. How we collect, use, and protect your data.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-10"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <h1 className="text-3xl font-semibold text-white mb-2">Privacy Policy</h1>
        <p className="text-slate-500 text-sm mb-10">Last updated: April 2026</p>

        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-white font-semibold text-base mb-3">1. Who we are</h2>
            <p>
              ColdCraft (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is an AI cold email generator available at{' '}
              <a href="https://coldcraft.rgwnd.app" className="text-blue-400 hover:text-blue-300">
                https://coldcraft.rgwnd.app
              </a>
              . For privacy-related inquiries, contact us at{' '}
              <a href="mailto:support@coldcraft.app" className="text-blue-400 hover:text-blue-300">
                support@coldcraft.app
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">2. Data we collect</h2>
            <p className="mb-3">We collect minimal data to operate the service:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-400">
              <li>
                <strong className="text-slate-300">Usage fingerprint</strong> — a randomly generated identifier stored in a cookie (<code className="bg-slate-800 px-1 rounded text-xs">coldcraft_fp</code>) to enforce the free daily limit of 3 emails. This is not linked to your identity.
              </li>
              <li>
                <strong className="text-slate-300">Email address (Pro users only)</strong> — when you verify your Pro status, we look up your email address against our Stripe customer records. The email is used solely to confirm an active subscription.
              </li>
              <li>
                <strong className="text-slate-300">Pro token cookie</strong> — after Pro verification, a signed token is stored in the <code className="bg-slate-800 px-1 rounded text-xs">coldcraft_pro_token</code> cookie so you don&apos;t need to re-verify on every visit. This token contains only your email and an expiry, and is signed server-side.
              </li>
            </ul>
            <p className="mt-3 text-slate-400">
              We do <strong className="text-slate-300">not</strong> store the email content you generate, your prospect data, or any other personal information beyond what is listed above.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">3. Cookies</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-slate-800 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-slate-900 text-slate-400">
                    <th className="text-left px-4 py-3 font-medium">Cookie</th>
                    <th className="text-left px-4 py-3 font-medium">Purpose</th>
                    <th className="text-left px-4 py-3 font-medium">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr>
                    <td className="px-4 py-3 font-mono">coldcraft_fp</td>
                    <td className="px-4 py-3 text-slate-400">Rate limiting — tracks daily free usage</td>
                    <td className="px-4 py-3 text-slate-400">1 year</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono">coldcraft_pro_token</td>
                    <td className="px-4 py-3 text-slate-400">Pro status — avoids re-verification on each visit</td>
                    <td className="px-4 py-3 text-slate-400">1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-slate-400">
              Both cookies are HttpOnly (not accessible to JavaScript) and set with <code className="bg-slate-800 px-1 rounded text-xs">SameSite=Lax</code>. No tracking or advertising cookies are used.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">4. Payment data</h2>
            <p className="text-slate-400">
              All payment processing is handled by <strong className="text-slate-300">Stripe</strong>. ColdCraft never sees or stores your card details. Stripe&apos;s privacy policy applies to payment data:{' '}
              <a href="https://stripe.com/privacy" className="text-blue-400 hover:text-blue-300" target="_blank" rel="noopener noreferrer">
                stripe.com/privacy
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">5. Data sharing</h2>
            <p className="text-slate-400">
              We do not sell, rent, or share your personal data with third parties for marketing purposes. Your data is shared only with Stripe as a payment processor (for Pro users), and with our hosting infrastructure necessary to run the service.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">6. Your rights (GDPR)</h2>
            <p className="mb-3 text-slate-400">
              If you are located in the European Economic Area, you have the following rights:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-400">
              <li><strong className="text-slate-300">Right of access</strong> — request a copy of the data we hold about you</li>
              <li><strong className="text-slate-300">Right to erasure</strong> — request deletion of your data</li>
              <li><strong className="text-slate-300">Right to object</strong> — object to how we process your data</li>
              <li><strong className="text-slate-300">Right to portability</strong> — receive your data in a portable format</li>
            </ul>
            <p className="mt-3 text-slate-400">
              To exercise any of these rights, email us at{' '}
              <a href="mailto:support@coldcraft.app" className="text-blue-400 hover:text-blue-300">
                support@coldcraft.app
              </a>
              . We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">7. Data retention</h2>
            <p className="text-slate-400">
              Usage records (fingerprint + daily count) are retained for up to 90 days for rate-limiting purposes and then deleted. Pro verification cookies expire after 1 year.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">8. Changes to this policy</h2>
            <p className="text-slate-400">
              We may update this policy from time to time. The &quot;last updated&quot; date at the top of this page will reflect any changes.
            </p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">9. Contact</h2>
            <p className="text-slate-400">
              Questions about this privacy policy?{' '}
              <a href="mailto:support@coldcraft.app" className="text-blue-400 hover:text-blue-300">
                support@coldcraft.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
