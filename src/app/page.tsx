import EmailGenerator from "@/components/EmailGenerator";
import PricingSection from "@/components/PricingSection";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "ColdCraft",
  "description": "Free AI cold email generator. Get 3 personalised cold email variants in seconds using proven frameworks.",
  "url": "https://coldcraft.rgwnd.app",
  "applicationCategory": "BusinessApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "EUR",
    "description": "3 free cold emails per day"
  }
};

export default function Home() {
  return (
    <div className="grain min-h-screen bg-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Nav */}
      <nav className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-semibold text-white tracking-tight">
            Cold<span className="text-blue-500">Craft</span>
          </span>
          <a
            href="#upgrade"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Pricing
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="scanlines relative overflow-hidden pt-20 pb-16 px-4 text-center">
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 text-xs text-blue-400 mb-6 animate-fade-up">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
            Free AI cold email generator — no sign-up required
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white mb-4 animate-fade-up delay-100">
            Cold emails that actually{" "}
            <span className="text-blue-500 italic">get replies</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto mb-8 animate-fade-up delay-200">
            Paste your offer and prospect details. Get 3 personalised cold
            email variants with subject lines — in seconds.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-slate-500 animate-fade-up delay-300">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              3 free emails/day
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              No sign-up
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Works for any industry
            </span>
          </div>
        </div>
      </section>

      {/* Generator */}
      <section className="px-4 pb-24">
        <div className="max-w-6xl mx-auto">
          <EmailGenerator />
        </div>
      </section>

      {/* Benefits */}
      <section className="border-t border-slate-800/60 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold text-white text-center mb-12">
            Why ColdCraft works
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: "⚡",
                title: "3 frameworks, 1 click",
                body: "Each generation gives you Problem-Solution, AIDA, and Pattern Interrupt variants. Pick the one that fits your style.",
              },
              {
                icon: "🎯",
                title: "Prospect-aware copy",
                body: "The AI uses the prospect's role, industry, and company to write specific lines — not generic boilerplate.",
              },
              {
                icon: "📈",
                title: "Proven structures",
                body: "Every email follows frameworks used by top SDRs. Short, direct, one clear CTA. No \"I hope this finds you well\".",
              },
            ].map((b) => (
              <div
                key={b.title}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6"
              >
                <div className="text-2xl mb-3">{b.icon}</div>
                <h3 className="font-semibold text-white mb-2">{b.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="upgrade" className="py-20 px-4 border-t border-slate-800/60">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-white mb-3">
            Unlimited cold emails
          </h2>
          <p className="text-slate-400 mb-12">
            Upgrade to Pro and generate as many emails as you need, every day.
          </p>
          <PricingSection />
        </div>
      </section>

      {/* FAQ — SEO content */}
      <section className="py-20 px-4 border-t border-slate-800/60">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-white mb-10 text-center">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "What is a cold email generator?",
                a: "A cold email generator is a tool that helps you write outreach emails to prospects who haven't heard from you before. ColdCraft uses AI to produce personalised, framework-driven cold emails based on your product and prospect details.",
              },
              {
                q: "How does the AI cold email generator work?",
                a: "You fill in your product description, target prospect's role and industry, your key value proposition, and optionally the prospect's name and company. ColdCraft's AI then produces 3 cold email variants — each using a different proven copywriting framework.",
              },
              {
                q: "Is ColdCraft free to use?",
                a: "Yes. You can generate 3 cold emails per day for free with no sign-up required. For unlimited daily emails, upgrade to ColdCraft Pro for €19/month.",
              },
              {
                q: "What cold email frameworks does ColdCraft use?",
                a: "ColdCraft generates one email per framework: Problem-Solution (identify the pain, offer the fix), AIDA (Attention → Interest → Desire → Action), and Pattern Interrupt (an unexpected opening that stops the scroll). Each approach works differently depending on your prospect.",
              },
              {
                q: "Does this work for any industry?",
                a: "Yes. The generator works for SaaS, agencies, e-commerce, real estate, recruiting, consulting, and any other B2B or B2C industry. Just describe your offer and your prospect clearly.",
              },
            ].map((item) => (
              <div key={item.q} className="border-b border-slate-800 pb-6">
                <h3 className="text-white font-medium mb-2">{item.q}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-slate-500 text-sm">
            Cold<span className="text-blue-500">Craft</span> — AI Cold Email Generator
          </span>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <a href="/privacy" className="hover:text-slate-300 transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-slate-300 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
