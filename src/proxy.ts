import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Edge-level AI-crawler blocking.
 *
 * Every uncached request on this site triggers a live scrape of the source
 * website inside a serverless function. AI crawlers (ClaudeBot, GPTBot,
 * ai_crawler, ...) burned ~186k function invocations in a single day
 * (Aug 1 2026), so known AI/scraping user agents are hard-stopped at the
 * edge with a 403 before they ever reach a route.
 *
 * Note on caching: this proxy cannot set `Cache-Control` on pass-through
 * responses — Next.js overwrites it for dynamic routes. Cache headers are
 * therefore set per-route instead: API routes via src/lib/http.ts, pages
 * via page-level `revalidate` (static routes only).
 *
 * Note (Next.js 16): this file is `proxy.ts` — the old `middleware.ts`
 * convention is deprecated and has been renamed.
 */
const BLOCKED_BOTS = [
  'claudebot',
  'claude-searchbot',
  'claude-user',
  'gptbot',
  'chatgpt-user',
  'oai-searchbot',
  'google-extended',
  'perplexitybot',
  'bytespider',
  'amazonbot',
  'applebot-extended',
  'ccbot',
  'ai2bot',
  'ai_crawler',
  'anthropic-ai',
  'meta-externalagent',
  'cohere-ai',
  'imagesiftbot',
  'diffbot',
  'petalbot',
];

export function proxy(request: NextRequest) {
  const userAgent = request.headers.get('user-agent')?.toLowerCase() ?? '';

  if (userAgent && BLOCKED_BOTS.some((bot) => userAgent.includes(bot))) {
    return new Response('Forbidden', {
      status: 403,
      headers: {
        'Cache-Control': 'public, s-maxage=3600',
        'X-Robots-Tag': 'noindex',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on everything except static assets and public files.
    // robots.txt must stay reachable so compliant crawlers read it.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|txt|xml)$).*)',
  ],
};
