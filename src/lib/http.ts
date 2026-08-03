import { NextResponse } from "next/server";

/**
 * JSON response helper for API routes with CDN caching.
 *
 * The proxy can't set `Cache-Control` on pass-through responses — Next.js
 * overwrites it for dynamic routes — so each route handler sets its own
 * header here. Vercel's edge honors s-maxage on serverless responses.
 *
 * Cache tiers:
 * - 'hour':  listing endpoints (main, trending, categories, category,
 *   actresses, actress, channels, channel, search, censored, uncensored,
 *   reducing-mosaic, /api docs)
 * - 'video': /api/video/* — these return Cloudflare R2 pre-signed stream
 *   URLs (~1h validity), so cache only 300s
 * - 'none':  responses that must never be cached (e.g. csrf-token)
 */
const CACHE_HOUR = "public, s-maxage=3600, stale-while-revalidate=3600";
const CACHE_VIDEO = "public, s-maxage=300, stale-while-revalidate=300";

export type ApiCacheTier = "hour" | "video" | "none";

export function apiJson(
  data: unknown,
  cache: ApiCacheTier = "hour",
  status = 200
) {
  const headers: Record<string, string> = {};
  if (cache === "hour") headers["Cache-Control"] = CACHE_HOUR;
  else if (cache === "video") headers["Cache-Control"] = CACHE_VIDEO;
  return NextResponse.json(data, { status, headers });
}
