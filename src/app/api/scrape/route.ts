import { NextRequest, NextResponse } from 'next/server';
import { runClaude } from '@/lib/claude-cli';

function extractText(html: string): string {
  // Remove scripts, styles, nav, header, footer, forms
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<header[\s\S]*?<\/header>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<form[\s\S]*?<\/form>/gi, ' ')
    // Keep block-level element text with spacing
    .replace(/<\/?(p|h[1-6]|li|td|th|div|section|article|main)[^>]*>/gi, '\n')
    // Strip remaining tags
    .replace(/<[^>]+>/g, ' ')
    // Decode common HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    // Collapse whitespace
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Truncate to avoid sending too much to the model
  return text.slice(0, 8000);
}

function extractMeta(html: string): { title: string; description: string } {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
    ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)
    ?? html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);

  return {
    title: titleMatch?.[1]?.trim() ?? '',
    description: descMatch?.[1]?.trim() ?? '',
  };
}

export async function POST(req: NextRequest) {
  let body: { url: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { url } = body;

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'A URL is required.' }, { status: 400 });
  }

  // Validate URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
  } catch {
    return NextResponse.json({ error: 'Invalid URL.' }, { status: 400 });
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return NextResponse.json({ error: 'Only HTTP/HTTPS URLs are allowed.' }, { status: 400 });
  }

  // Block private/internal addresses
  const hostname = parsedUrl.hostname.toLowerCase();
  if (
    hostname === 'localhost' ||
    hostname.startsWith('127.') ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('172.') ||
    hostname === '0.0.0.0' ||
    hostname.endsWith('.local')
  ) {
    return NextResponse.json({ error: 'URL not allowed.' }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const fetchRes = await fetch(parsedUrl.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ColdCraft/1.0; +https://coldcraft.rgwnd.app)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    }).finally(() => clearTimeout(timeout));

    if (!fetchRes.ok) {
      return NextResponse.json(
        { error: `Could not fetch page (HTTP ${fetchRes.status}).` },
        { status: 422 }
      );
    }

    const contentType = fetchRes.headers.get('content-type') ?? '';
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      return NextResponse.json(
        { error: 'URL does not point to an HTML page.' },
        { status: 422 }
      );
    }

    const html = await fetchRes.text();
    const { title, description } = extractMeta(html);
    const bodyText = extractText(html);

    // Use claude CLI to extract structured info
    const prompt = `You are extracting product/company information from a webpage to help write cold emails.

PAGE TITLE: ${title}
META DESCRIPTION: ${description}

PAGE TEXT (truncated):
${bodyText}

Extract the following and respond ONLY with valid JSON, no markdown:
{
  "companyName": "company name or empty string",
  "product": "2-4 sentence description of what this company/product does, who it's for, and its main features — suitable as a cold email product description",
  "valueProp": "1-2 sentence key value proposition based on what you found, or empty string if unclear",
  "targetAudience": "who they serve (industry, role, company type) or empty string"
}

Be factual. Only use information present on the page. If info is missing, use empty string.`;

    const rawText = await runClaude(prompt, {
      timeoutMs: 20_000,
      maxBufferBytes: 524_288,
    });

    let parsed: { companyName: string; product: string; valueProp: string; targetAudience: string };
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('Model returned non-JSON output.');
      parsed = JSON.parse(match[0]);
    }

    return NextResponse.json({
      companyName: parsed.companyName ?? '',
      product: parsed.product ?? '',
      valueProp: parsed.valueProp ?? '',
      targetAudience: parsed.targetAudience ?? '',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('aborted') || message.includes('timeout')) {
      return NextResponse.json({ error: 'Request timed out. Try again.' }, { status: 408 });
    }
    console.error('[/api/scrape] error:', err);
    return NextResponse.json({ error: 'Failed to scrape page. Try filling manually.' }, { status: 500 });
  }
}
