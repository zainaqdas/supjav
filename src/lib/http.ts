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
const CACHE_NONE = "no-store, max-age=0, must-revalidate";

export type ApiCacheTier = "hour" | "video" | "none";

export function apiJson(
  data: unknown,
  cache: ApiCacheTier = "hour",
  status = 200
) {
  const headers: Record<string, string> = {};
  if (cache === "hour") headers["Cache-Control"] = CACHE_HOUR;
  else if (cache === "video") headers["Cache-Control"] = CACHE_VIDEO;
  // Always state a policy explicitly. Omitting Cache-Control leaves it to the
  // framework, which is not what "never cache" means.
  else headers["Cache-Control"] = CACHE_NONE;
  return NextResponse.json(data, { status, headers });
}

// ============================================================
// REQUEST PARAMETER VALIDATION
//
// Every route used to do a bare `parseInt(searchParams.get("page") || "1")`,
// which let NaN, negatives and 1e21-style values reach the scraper and (after
// ISR caching) mint a cache entry per distinct value. These helpers keep all
// of that in one place.
// ============================================================

/**
 * Upper bound on `page`. The deepest paginated listing on the source is a few
 * hundred pages, so this is generous while still bounding cache-key space.
 */
export const MAX_PAGE = 1000;

/**
 * Coerce a `?page=` value to a usable positive integer.
 * Anything unparseable, zero, negative or oversized falls back to 1.
 */
export function parsePage(raw: string | null | undefined): number {
  if (raw == null || raw === "") return 1;
  // Require a plain integer string: rejects "1e3", "0x10", "12abc", " 3 ".
  if (!/^\d+$/.test(raw.trim())) return 1;
  const n = Number.parseInt(raw.trim(), 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, MAX_PAGE);
}

/** 8-value sort set honored by /videos, /censored, /uncensored, /reducing-mosaic. */
export const LISTING_SORTS = [
  "added_today",
  "added_week",
  "added_month",
  "most_liked",
  "most_viewed",
  "popular_today",
  "popular_week",
  "popular_month",
] as const;

/** 4-value sort set honored by /category/:slug, /actress/:slug, /channel/:slug. */
export const DETAIL_SORTS = [
  "popular",
  "added_today",
  "added_week",
  "added_month",
] as const;

export type ListingSort = (typeof LISTING_SORTS)[number];
export type DetailSort = (typeof DETAIL_SORTS)[number];

/**
 * Validate a `?sort=` value against the set the given route actually supports.
 * Unknown values are dropped rather than forwarded — the source silently falls
 * back to default ordering for unsupported values anyway, so rejecting them
 * just makes the contract honest and bounds the cache-key space.
 */
export function parseSort<T extends string>(
  raw: string | null | undefined,
  allowed: readonly T[]
): T | undefined {
  if (!raw) return undefined;
  const value = raw.trim();
  return (allowed as readonly string[]).includes(value)
    ? (value as T)
    : undefined;
}

/**
 * Slugs (category, actress, channel, video) must be a single safe path
 * segment. This blocks `..`, `/`, `?`, `#` and friends from reaching the
 * upstream URL builder.
 */
export function isValidSlug(value: string | undefined | null): value is string {
  return typeof value === "string" && /^[A-Za-z0-9._~-]{1,128}$/.test(value);
}

/** Video ids are numeric on the source. */
export function isValidVideoId(
  value: string | undefined | null
): value is string {
  return typeof value === "string" && /^\d{1,12}$/.test(value);
}

/** Build the standard 400 response for a rejected query parameter. */
export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}