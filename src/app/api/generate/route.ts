import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getDb } from '@/lib/db';
import { verifyProToken, COOKIE_NAME as PRO_COOKIE } from '@/lib/pro-token';
import { runClaude } from '@/lib/claude-cli';

const FP_COOKIE = 'coldcraft_fp';
const DAILY_LIMIT = 3;

const MAX_LENGTHS: Record<string, number> = {
  product: 500,
  prospectRole: 100,
  prospectIndustry: 100,
  valueProposition: 500,
  prospectName: 100,
  prospectCompany: 100,
};

function sanitize(value: string, maxLen: number): string {
  return value
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLen);
}

interface GenerateRequest {
  product: string;
  prospectRole: string;
  prospectIndustry: string;
  valueProposition: string;
  prospectName?: string;
  prospectCompany?: string;
  tone: 'professional' | 'casual' | 'bold';
  length: 'short' | 'medium' | 'long';
}

interface Email {
  subject: string;
  body: string;
  framework: string;
}

const lengthGuide = {
  short: '3–5 sentences per email, under 100 words in the body',
  medium: '5–8 sentences per email, 100–180 words in the body',
  long: '8–12 sentences per email, 180–280 words in the body',
};

const toneGuide = {
  professional: 'formal, polished, business-appropriate language',
  casual: 'conversational, friendly, approachable language — contractions are fine',
  bold: 'direct, confident, slightly provocative — challenge assumptions',
};

export async function POST(req: NextRequest) {
  const response = NextResponse.next();

  // --- Pro check via signed cookie (no Stripe call needed) ---
  const proToken = req.cookies.get(PRO_COOKIE)?.value ?? '';
  const isPro = proToken ? verifyProToken(proToken) : false;

  // --- Fingerprint cookie ---
  let fingerprint = req.cookies.get(FP_COOKIE)?.value ?? '';
  let isNewFingerprint = false;
  if (!fingerprint) {
    fingerprint = randomUUID();
    isNewFingerprint = true;
  }

  // --- Usage check for free users ---
  if (!isPro) {
    try {
      const db = await getDb();
      const result = await db.query<{ count: number; was_limited: boolean }>(
        `WITH prev AS (
           SELECT count AS c FROM usage
           WHERE fingerprint_id = $1 AND usage_date = CURRENT_DATE
         )
         INSERT INTO usage (fingerprint_id, usage_date, count)
         VALUES ($1, CURRENT_DATE, 1)
         ON CONFLICT (fingerprint_id, usage_date)
         DO UPDATE SET count = LEAST(usage.count + 1, $2)
         RETURNING count, COALESCE((SELECT c FROM prev), 0) >= $2 AS was_limited`,
        [fingerprint, DAILY_LIMIT]
      );
      if (result.rows[0].was_limited) {
        const res = NextResponse.json(
          { error: 'Rate limit exceeded. You can generate up to 3 times per day.' },
          { status: 429 }
        );
        if (isNewFingerprint) {
          res.cookies.set(FP_COOKIE, fingerprint, { httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 365, secure: process.env.NODE_ENV === 'production' });
        }
        return res;
      }
    } catch (err) {
      console.error('[/api/generate] DB error:', err);
      // Fail open — don't block users if DB is down
    }
  }

  // --- Parse and validate body ---
  let body: GenerateRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { product, prospectRole, prospectIndustry, valueProposition, prospectName, prospectCompany, tone, length } = body;

  const clean = {
    product: sanitize(product ?? '', MAX_LENGTHS.product),
    prospectRole: sanitize(prospectRole ?? '', MAX_LENGTHS.prospectRole),
    prospectIndustry: sanitize(prospectIndustry ?? '', MAX_LENGTHS.prospectIndustry),
    valueProposition: sanitize(valueProposition ?? '', MAX_LENGTHS.valueProposition),
    prospectName: sanitize(prospectName ?? '', MAX_LENGTHS.prospectName),
    prospectCompany: sanitize(prospectCompany ?? '', MAX_LENGTHS.prospectCompany),
  };

  if (!clean.product || !clean.prospectRole || !clean.prospectIndustry || !clean.valueProposition) {
    return NextResponse.json(
      { error: 'Missing required fields: product, prospectRole, prospectIndustry, valueProposition.' },
      { status: 400 }
    );
  }

  const validTones = ['professional', 'casual', 'bold'];
  const validLengths = ['short', 'medium', 'long'];
  if (!validTones.includes(tone) || !validLengths.includes(length)) {
    return NextResponse.json({ error: 'Invalid tone or length value.' }, { status: 400 });
  }

  // --- Build prompt ---
  const systemPrompt = `You are an expert cold email copywriter. Your job is to write cold emails that actually get responses.

Rules you MUST follow:
- Never start with "I hope this finds you well", "My name is", "I wanted to reach out", or any similar filler openers
- Be direct and specific to the prospect's role and industry — generic emails fail
- Each email must have exactly ONE clear call to action (one ask, not multiple)
- Reference the prospect's role (${clean.prospectRole}) and industry (${clean.prospectIndustry}) in a specific, credible way
- Avoid buzzwords and empty claims — every sentence must earn its place
- Write in ${toneGuide[tone as keyof typeof toneGuide]}
- Target length: ${lengthGuide[length as keyof typeof lengthGuide]}
- Each email must follow its assigned framework strictly

Frameworks:
1. Problem-Solution: Open with a specific problem the prospect likely faces given their role/industry. Present the product as the solution. End with a low-friction CTA.
2. AIDA (Attention-Interest-Desire-Action): Grab attention with a provocative or data-driven opener. Build interest with relevance to their world. Create desire by painting the outcome. Close with a single action.
3. Pattern Interrupt: Start with something unexpected — a counterintuitive statement, a question, or a bold claim — that breaks the typical cold email mold. Then pivot quickly to value and a CTA.

Output ONLY valid JSON. No markdown, no explanation, no code fences. The JSON must be an object with a single key "emails" containing an array of exactly 3 email objects, each with keys: "subject", "body", "framework".`;

  const prospectIdentity = [
    clean.prospectName ? `Name: ${clean.prospectName}` : null,
    clean.prospectCompany ? `Company: ${clean.prospectCompany}` : null,
    `Role: ${clean.prospectRole}`,
    `Industry: ${clean.prospectIndustry}`,
  ].filter(Boolean).join('\n');

  const userPrompt = `Generate exactly 3 cold emails for the following prospect and product.

PROSPECT
${prospectIdentity}

PRODUCT / SERVICE
${clean.product}

KEY VALUE PROPOSITION
${clean.valueProposition}

TONE: ${tone}
LENGTH: ${length}

Write all 3 emails — one using Problem-Solution, one using AIDA, one using Pattern Interrupt — and return them as JSON exactly matching this shape:
{
  "emails": [
    { "subject": "...", "body": "...", "framework": "Problem-Solution" },
    { "subject": "...", "body": "...", "framework": "AIDA" },
    { "subject": "...", "body": "...", "framework": "Pattern Interrupt" }
  ]
}`;

  const fullPrompt = `${systemPrompt}\n\n---\n\n${userPrompt}`;

  try {
    const rawText = await runClaude(fullPrompt, {
      timeoutMs: 30_000,
      maxBufferBytes: 1_048_576,
    });

    let parsed: { emails: Email[] };
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('Model returned non-JSON output.');
      parsed = JSON.parse(match[0]);
    }

    if (
      !Array.isArray(parsed.emails) ||
      parsed.emails.length !== 3 ||
      parsed.emails.some((e) => typeof e.subject !== 'string' || typeof e.body !== 'string' || typeof e.framework !== 'string')
    ) {
      throw new Error('Unexpected response shape from model.');
    }

    const res = NextResponse.json({ emails: parsed.emails });
    if (isNewFingerprint) {
      res.cookies.set(FP_COOKIE, fingerprint, { httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 365, secure: process.env.NODE_ENV === 'production' });
    }
    return res;
  } catch (err) {
    console.error('[/api/generate] error:', err);
    return NextResponse.json(
      { error: 'Failed to generate emails. Please try again.' },
      { status: 500 }
    );
  }
}
