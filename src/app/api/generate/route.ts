import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';

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
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '') // strip control chars
    .replace(/[<>]/g, '')                                // strip angle brackets
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

// In-memory rate limiter: IP -> { count, resetAt }
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const midnight = new Date();
  midnight.setUTCHours(24, 0, 0, 0);
  const resetAt = midnight.getTime();

  const entry = rateLimitMap.get(ip);
  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt });
    return false;
  }
  if (entry.count >= 3) {
    return true;
  }
  entry.count += 1;
  return false;
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
  // Rate limiting
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1';
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. You can generate up to 3 times per day.' },
      { status: 429 }
    );
  }

  // Parse and validate request body
  let body: GenerateRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const {
    product,
    prospectRole,
    prospectIndustry,
    valueProposition,
    prospectName,
    prospectCompany,
    tone,
    length,
  } = body;

  // Sanitize all string inputs
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
      {
        error:
          'Missing required fields: product, prospectRole, prospectIndustry, valueProposition.',
      },
      { status: 400 }
    );
  }

  const validTones = ['professional', 'casual', 'bold'];
  const validLengths = ['short', 'medium', 'long'];
  if (!validTones.includes(tone) || !validLengths.includes(length)) {
    return NextResponse.json(
      { error: 'Invalid tone or length value.' },
      { status: 400 }
    );
  }

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
  ]
    .filter(Boolean)
    .join('\n');

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { ANTHROPIC_API_KEY: _drop, ...safeEnv } = process.env;
    const rawText = execSync('claude -p -', {
      input: fullPrompt,
      env: { ...safeEnv, CLAUDE_CODE_OAUTH_TOKEN: process.env.CLAUDE_CODE_OAUTH_TOKEN ?? '' },
      timeout: 30000,
      maxBuffer: 1024 * 1024,
    }).toString().trim();

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
      parsed.emails.some(
        (e) =>
          typeof e.subject !== 'string' ||
          typeof e.body !== 'string' ||
          typeof e.framework !== 'string'
      )
    ) {
      throw new Error('Unexpected response shape from model.');
    }

    return NextResponse.json({ emails: parsed.emails });
  } catch (err) {
    console.error('[/api/generate] error:', err);
    return NextResponse.json(
      { error: 'Failed to generate emails. Please try again.' },
      { status: 500 }
    );
  }
}
