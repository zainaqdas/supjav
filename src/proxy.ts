import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Edge-level AI-crawler blocking + HTML CDN caching.
 *
 * Blocking: every uncached request on this site triggers a live scrape of
 * the source website inside a serverless function. AI crawlers (ClaudeBot,
 * GPTBot, ai_crawler, ...) burned ~186k function invocations in a single
 * day (Aug 1 2026), so known AI/scraping user agents are hard-stopped at
 * the edge with a 403 before they ever reach a route.
 *
 * Caching: the pages in this app read `searchParams`, which opts them into
 * dynamic rendering — so page-level `revalidate` exports are ignored and
 * every page view runs a serverless function. To make caching real, we
 * attach CDN `Cache-Control` headers here (Vercel's edge honors s-maxage
 * on responses from serverless functions). This covers both pages and the
 * `/api/*` scraper endpoints, so repeat calls (humans, aggregators, bots)
 * hit the edge instead of re-scraping javtiful.com.
 *
 * Cache tiers:
 * - 3600s: listing pages + listing API endpoints (main, trending,
 *   categories, category, actresses, actress, channels, channel, search,
 *   censored, uncensored, reducing-mosaic)
 * - 300s:  `/video/*` pages and `/api/video/*` — their stream URLs are
 *   Cloudflare R2 pre-signed (~1h validity), so a longer cache could
 *   serve expired streams
 * - never: `/api/csrf-token` (tokens must not be cached) and
 *   `/api/proxy/image` (the route sets its own 24h cache)
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

const CACHE_HOUR = 'public, s-maxage=3600, stale-while-revalidate=3600';
const CACHE_VIDEO = 'public, s-maxage=300, stale-while-revalidate=300';

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

  const pathname = request.nextUrl.pathname;
  if (request.method === 'GET') {
    // Skip endpoints that manage their own caching or must not be cached.
    if (
      pathname === '/api/proxy/image' ||
      pathname.startsWith('/api/csrf-token')
    ) {
      return NextResponse.next();
    }

    const isApi = pathname.startsWith('/api/');
    // Video endpoints expose pre-signed stream URLs (~1h validity) — cache them short.
    const isVideo = pathname.startsWith(isApi ? '/api/video/' : '/video/');

    const res = NextResponse.next();
    res.headers.set('Cache-Control', isVideo ? CACHE_VIDEO : CACHE_HOUR);
    return res;
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
