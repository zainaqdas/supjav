import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Edge-level request filtering.
 *
 * Two jobs:
 *
 * 1. AI-crawler blocking. Every uncached request on this site triggers a live
 *    scrape of the source website inside a serverless function. AI crawlers
 *    (ClaudeBot, GPTBot, ai_crawler, ...) burned ~186k function invocations in
 *    a single day (Aug 1 2026), so known AI/scraping user agents are
 *    hard-stopped at the edge with a 403 before they ever reach a route.
 *
 * 2. Param-shape rejection. Every listing page reads `searchParams`, which
 *    forces dynamic rendering. In a dynamic route `notFound()` renders the
 *    404 UI but cannot change the status code — the response has already
 *    begun streaming — so the page is served as a **200 soft 404**. Search
 *    engines index those as real pages. Rejecting malformed params here
 *    returns a genuine 404 and skips the function invocation entirely.
 *
 * Note on caching: this proxy cannot set `Cache-Control` on pass-through
 * responses — Next.js overwrites it for dynamic routes. Cache headers are
 * therefore set per-route instead: API routes via src/lib/http.ts, pages
 * via page-level `revalidate`, and upstream scrape results via the data cache
 * in src/lib/api.ts.
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

// Mirrors isValidSlug / isValidVideoId in src/lib/http.ts. Kept inline so the
// check needs no import of a module that also pulls in NextResponse helpers.
const SLUG_RE = /^[A-Za-z0-9._~-]{1,128}$/;
const VIDEO_ID_RE = /^\d{1,12}$/;

/** `/category/x`, `/actress/x`, `/channel/x` — exactly one safe slug segment. */
const ENTITY_RE = /^\/(category|actress|channel)\/([^/]+)$/;
/** `/video/:id/:slug` — numeric id plus a safe slug. */
const VIDEO_RE = /^\/video\/([^/]+)\/([^/]+)$/;

function notFoundResponse(): Response {
  return new Response('Not Found', {
    status: 404,
    headers: {
      'Cache-Control': 'public, s-maxage=300',
      'X-Robots-Tag': 'noindex',
      'Content-Type': 'text/plain;charset=UTF-8',
    },
  });
}

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

  // API routes validate their own params and return descriptive 400s, so only
  // page routes are shape-checked here.
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith('/api')) {
    const entity = ENTITY_RE.exec(pathname);
    if (entity && !SLUG_RE.test(entity[2])) {
      return notFoundResponse();
    }

    const video = VIDEO_RE.exec(pathname);
    if (video && (!VIDEO_ID_RE.test(video[1]) || !SLUG_RE.test(video[2]))) {
      return notFoundResponse();
    }
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