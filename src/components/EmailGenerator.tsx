"use client";

import { useState, useEffect, useCallback } from "react";
import UpgradeModal from "./UpgradeModal";

type Tone = "professional" | "casual" | "bold";
type Length = "short" | "medium" | "long";

interface FormData {
  product: string;
  prospectRole: string;
  prospectIndustry: string;
  valueProposition: string;
  prospectName: string;
  prospectCompany: string;
  tone: Tone;
  length: Length;
}

interface EmailVariant {
  subject: string;
  body: string;
  framework: string;
}

const DAILY_CREDITS = 3;
const CREDITS_KEY = "coldcraft_credits";
const CREDITS_DATE_KEY = "coldcraft_credits_date";
const PRO_KEY = "coldcraft_pro";

function getCredits(): number {
  if (typeof window === "undefined") return DAILY_CREDITS;
  const storedDate = localStorage.getItem(CREDITS_DATE_KEY);
  const today = new Date().toDateString();
  if (storedDate !== today) {
    localStorage.setItem(CREDITS_DATE_KEY, today);
    localStorage.setItem(CREDITS_KEY, String(DAILY_CREDITS));
    return DAILY_CREDITS;
  }
  const stored = localStorage.getItem(CREDITS_KEY);
  return stored !== null ? parseInt(stored, 10) : DAILY_CREDITS;
}

function decrementCredits(): void {
  const current = getCredits();
  localStorage.setItem(CREDITS_KEY, String(Math.max(0, current - 1)));
}

function isPro(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(PRO_KEY);
}

const TONE_OPTIONS: { value: Tone; label: string; description: string }[] = [
  { value: "professional", label: "Professional", description: "Polished & direct" },
  { value: "casual", label: "Casual", description: "Warm & conversational" },
  { value: "bold", label: "Bold", description: "Confident & punchy" },
];

const LENGTH_OPTIONS: { value: Length; label: string; words: string }[] = [
  { value: "short", label: "Short", words: "~80 words" },
  { value: "medium", label: "Medium", words: "~150 words" },
  { value: "long", label: "Long", words: "~200 words" },
];

const FRAMEWORKS = ["Problem-Solution", "AIDA", "Pattern Interrupt"];

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-5 space-y-4">
      <div className="shimmer h-4 w-3/4 rounded" />
      <div className="space-y-2">
        <div className="shimmer h-3 w-full rounded" />
        <div className="shimmer h-3 w-full rounded" />
        <div className="shimmer h-3 w-5/6 rounded" />
        <div className="shimmer h-3 w-full rounded" />
        <div className="shimmer h-3 w-4/5 rounded" />
        <div className="shimmer h-3 w-full rounded" />
      </div>
      <div className="shimmer h-8 w-24 rounded-lg" />
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-1.5 font-mono text-xs text-slate-300 transition-all duration-150 hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-400 active:scale-95"
    >
      {copied ? (
        <>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy email
        </>
      )}
    </button>
  );
}

function EmailCard({ variant, index }: { variant: EmailVariant; index: number }) {
  const frameworkColors: Record<string, string> = {
    "Problem-Solution": "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    "AIDA": "text-blue-400 bg-blue-400/10 border-blue-400/20",
    "Pattern Interrupt": "text-amber-400 bg-amber-400/10 border-amber-400/20",
  };

  const colorClass = frameworkColors[variant.framework] ?? "text-slate-400 bg-slate-400/10 border-slate-400/20";

  return (
    <div
      className="animate-fade-up rounded-xl border border-slate-700/50 bg-slate-800/60 p-5 space-y-4 transition-all duration-300 hover:border-slate-600 hover:bg-slate-800"
      style={{ animationDelay: `${index * 0.12}s` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-mono text-xs text-slate-500 mb-1 uppercase tracking-widest">Subject</p>
          <p className="font-semibold text-slate-100 leading-snug">{variant.subject}</p>
        </div>
        <span className={`shrink-0 rounded-md border px-2 py-0.5 font-mono text-xs ${colorClass}`}>
          {variant.framework}
        </span>
      </div>

      <div className="border-t border-slate-700/50 pt-4">
        <p className="font-mono text-xs text-slate-500 mb-2 uppercase tracking-widest">Body</p>
        <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-[var(--font-dm-sans)]">
          {variant.body}
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <CopyButton text={`Subject: ${variant.subject}\n\n${variant.body}`} />
        <span className="font-mono text-xs text-slate-600">Variant {index + 1}</span>
      </div>
    </div>
  );
}

export default function EmailGenerator() {
  const [form, setForm] = useState<FormData>({
    product: "",
    prospectRole: "",
    prospectIndustry: "",
    valueProposition: "",
    prospectName: "",
    prospectCompany: "",
    tone: "professional",
    length: "medium",
  });

  const [credits, setCredits] = useState<number>(DAILY_CREDITS);
  const [pro, setPro] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<EmailVariant[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [scrapeUrl, setScrapeUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);

  useEffect(() => {
    setCredits(getCredits());
    setPro(isPro());
  }, []);

  const canGenerate = pro || credits > 0;

  const handleChange = useCallback(
    (field: keyof FormData) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
      },
    []
  );

  const handleTone = (tone: Tone) => setForm((prev) => ({ ...prev, tone }));
  const handleLength = (length: Length) => setForm((prev) => ({ ...prev, length }));

  const handleScrape = async () => {
    const url = scrapeUrl.trim();
    if (!url) return;
    setScraping(true);
    setScrapeError(null);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? `Error ${res.status}`);
      }
      setForm((prev) => ({
        ...prev,
        product: data.product || prev.product,
        valueProposition: data.valueProp || prev.valueProposition,
      }));
    } catch (err) {
      setScrapeError(err instanceof Error ? err.message : "Scraping failed. Fill in manually.");
    } finally {
      setScraping(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canGenerate) return;
    if (!form.product.trim()) {
      setError("Please describe your product or service.");
      return;
    }

    if (!form.prospectRole.trim() || !form.prospectIndustry.trim() || !form.valueProposition.trim()) {
      setError("Please fill in prospect role, industry, and value proposition.");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Server error ${res.status}`);
      }

      const data = await res.json();

      if (!Array.isArray(data.emails) || data.emails.length === 0) {
        throw new Error("No emails returned. Please try again.");
      }

      setResults(data.emails);

      if (!pro) {
        decrementCredits();
        setCredits(getCredits());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    "w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 transition-colors duration-150 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30 font-[var(--font-dm-sans)]";

  const labelClasses =
    "block font-mono text-xs text-slate-500 uppercase tracking-widest mb-1.5";

  return (
    <section id="generator" className="relative">
      {/* Section label */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-px flex-1 bg-slate-800" />
        <span className="font-mono text-xs text-slate-600 uppercase tracking-widest">Generator</span>
        <div className="h-px flex-1 bg-slate-800" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT: Form Panel */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 space-y-5 backdrop-blur-sm sticky top-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-[var(--font-dm-serif)] text-xl text-slate-100">
              Craft your email
            </h2>
            {!pro && (
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {Array.from({ length: DAILY_CREDITS }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 w-2 rounded-full transition-colors duration-300 ${
                        i < credits ? "bg-blue-500" : "bg-slate-700"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-mono text-xs text-slate-500">
                  {credits}/{DAILY_CREDITS} free
                </span>
                <button
                  type="button"
                  onClick={() => setShowUpgrade(true)}
                  className="font-mono text-xs text-blue-400 border border-blue-400/30 bg-blue-400/10 rounded px-2 py-0.5 hover:bg-blue-400/20 transition-colors"
                >
                  Upgrade
                </button>
              </div>
            )}
            {pro && (
              <span className="font-mono text-xs text-blue-400 border border-blue-400/30 bg-blue-400/10 rounded px-2 py-0.5">
                PRO ∞
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* URL Scraper */}
            <div className="rounded-lg border border-slate-700/60 bg-slate-800/40 p-3 space-y-2">
              <label className={labelClasses}>Auto-fill from website <span className="normal-case text-slate-600">(optional)</span></label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={scrapeUrl}
                  onChange={(e) => { setScrapeUrl(e.target.value); setScrapeError(null); }}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleScrape(); } }}
                  placeholder="https://yourproduct.com"
                  className={`${inputClasses} flex-1`}
                  disabled={scraping}
                />
                <button
                  type="button"
                  onClick={handleScrape}
                  disabled={scraping || !scrapeUrl.trim()}
                  className="shrink-0 rounded-lg border border-slate-600 bg-slate-700/60 px-3 py-2 text-sm text-slate-300 transition-all duration-150 hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-400 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
                >
                  {scraping ? (
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                    </svg>
                  )}
                </button>
              </div>
              {scrapeError && (
                <p className="font-mono text-xs text-amber-400/80">{scrapeError}</p>
              )}
              {!scrapeError && (
                <p className="font-mono text-xs text-slate-600">Paste your product URL to auto-fill the fields below</p>
              )}
            </div>

            {/* Product */}
            <div>
              <label className={labelClasses}>Your product / service *</label>
              <textarea
                rows={3}
                required
                value={form.product}
                onChange={handleChange("product")}
                placeholder="e.g. A B2B SaaS tool that automates invoice reconciliation for finance teams"
                className={`${inputClasses} resize-none`}
              />
            </div>

            {/* Prospect role + industry */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClasses}>Prospect role *</label>
                <input
                  type="text"
                  value={form.prospectRole}
                  onChange={handleChange("prospectRole")}
                  placeholder="e.g. CFO"
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>Industry *</label>
                <input
                  type="text"
                  value={form.prospectIndustry}
                  onChange={handleChange("prospectIndustry")}
                  placeholder="e.g. SaaS"
                  className={inputClasses}
                />
              </div>
            </div>

            {/* Value prop */}
            <div>
              <label className={labelClasses}>Key value proposition *</label>
              <textarea
                rows={2}
                value={form.valueProposition}
                onChange={handleChange("valueProposition")}
                placeholder="e.g. Saves finance teams 10 hours/week and reduces reconciliation errors by 90%"
                className={`${inputClasses} resize-none`}
              />
            </div>

            {/* Prospect name + company */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClasses}>Prospect name <span className="normal-case not-italic text-slate-600">(optional)</span></label>
                <input
                  type="text"
                  value={form.prospectName}
                  onChange={handleChange("prospectName")}
                  placeholder="e.g. Sarah"
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>Company <span className="normal-case text-slate-600">(optional)</span></label>
                <input
                  type="text"
                  value={form.prospectCompany}
                  onChange={handleChange("prospectCompany")}
                  placeholder="e.g. Acme Corp"
                  className={inputClasses}
                />
              </div>
            </div>

            {/* Tone */}
            <div>
              <label className={labelClasses}>Tone</label>
              <div className="grid grid-cols-3 gap-2">
                {TONE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleTone(option.value)}
                    className={`rounded-lg border px-3 py-2.5 text-left transition-all duration-150 ${
                      form.tone === option.value
                        ? "border-blue-500 bg-blue-500/15 text-blue-300"
                        : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600 hover:text-slate-300"
                    }`}
                  >
                    <div className="text-sm font-medium leading-none mb-1">{option.label}</div>
                    <div className="font-mono text-xs opacity-70">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Length */}
            <div>
              <label className={labelClasses}>Email length</label>
              <div className="grid grid-cols-3 gap-2">
                {LENGTH_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleLength(option.value)}
                    className={`rounded-lg border px-3 py-2.5 text-center transition-all duration-150 ${
                      form.length === option.value
                        ? "border-blue-500 bg-blue-500/15 text-blue-300"
                        : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600 hover:text-slate-300"
                    }`}
                  >
                    <div className="text-sm font-medium leading-none mb-1">{option.label}</div>
                    <div className="font-mono text-xs opacity-70">{option.words}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate button or upgrade prompt */}
            {canGenerate ? (
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating 3 variants...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate 3 Cold Emails
                  </span>
                )}
              </button>
            ) : (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-center space-y-3">
                <p className="text-sm text-amber-200 font-medium">
                  You&apos;ve used your 3 free emails for today
                </p>
                <p className="font-mono text-xs text-amber-400/70">
                  Resets tomorrow · or upgrade for unlimited
                </p>
                <button
                  type="button"
                  onClick={() => setShowUpgrade(true)}
                  className="inline-block rounded-lg bg-amber-500 px-5 py-2 text-sm font-semibold text-slate-900 transition-all duration-150 hover:bg-amber-400 active:scale-95"
                >
                  Upgrade to Pro →
                </button>
              </div>
            )}
          </form>
        </div>

        {/* RIGHT: Results Panel */}
        <div className="space-y-4 min-h-[400px]">
          {!loading && !results && !error && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700/60 bg-slate-900/30 p-12 text-center min-h-[400px]">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800">
                <svg className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-slate-500 text-sm font-[var(--font-dm-sans)]">
                Your 3 email variants will appear here
              </p>
              <p className="font-mono text-xs text-slate-700 mt-1">
                Fill the form and click Generate
              </p>
            </div>
          )}

          {loading && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="font-mono text-xs text-blue-400">Generating variants</span>
                <span className="font-mono text-xs text-slate-600 cursor-blink">_</span>
              </div>
              {FRAMEWORKS.map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {error && !loading && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 flex gap-3">
              <svg className="h-5 w-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-300">Generation failed</p>
                <p className="font-mono text-xs text-red-400/70 mt-0.5">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 font-mono text-xs text-red-400 hover:text-red-300 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {results && !loading && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-mono text-xs text-emerald-400">
                  {results.length} variants generated
                </span>
                {!pro && (
                  <span className="font-mono text-xs text-slate-600 ml-auto">
                    {credits} credit{credits !== 1 ? "s" : ""} remaining
                  </span>
                )}
              </div>
              {results.map((variant, i) => (
                <EmailCard key={i} variant={variant} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </section>
  );
}
