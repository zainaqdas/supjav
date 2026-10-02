import { apiJson } from "@/lib/http";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export async function GET() {
  return apiJson({
    name: `${SITE_NAME} Scraper API`,
    version: "2.2.0",
    baseUrl: SITE_URL,
    upstream: "https://javtiful.com",
    endpoints: {
      main: "/api/main",
      trending: "/api/trending",
      videos: "/api/videos?page=1&sort=added_week",
      categories: "/api/categories",
      category: "/api/category/:slug",
      actresses: "/api/actresses",
      actress: "/api/actress/:slug",
      channels: "/api/channels",
      channel: "/api/channel/:slug",
      search: "/api/search?q=query",
      video: "/api/video/:id",
      videoWithSlug: "/api/video/:id/:slug",
      videoStream: "/api/video/:id/stream",
      comments: "/api/video/:id/comments",
      downloadLink: "/api/video/:id/download-link",
      proxyImage: "/api/proxy/image?url=<encoded javtiful.com or r2.cloudflarestorage.com image URL>",
      csrfToken: "/api/csrf-token",
    },
    queryParams: {
      page: "Page number for paginated results (default: 1, max: 1000). Non-integer, zero, negative and out-of-range values fall back to 1.",
      q: "Search query for /api/search (required, max 120 characters).",
      sort: [
        "Video listings (/api/videos, /api/censored, /api/uncensored, /api/reducing-mosaic): added_today, added_week, added_month, most_liked, most_viewed, popular_today, popular_week, popular_month",
        "Entity pages (/api/category/:slug, /api/actress/:slug, /api/channel/:slug): popular, added_today, added_week, added_month — the source only honors these values there",
        "Unrecognized sort values are ignored rather than forwarded.",
      ],
    },
    validation: {
      slug: "category/actress/channel/video slugs must match [A-Za-z0-9._~-]{1,128}; video ids must be numeric. Requests with anything else return 400.",
    },
    caching: {
      hour: "Listings, entity pages & docs — CDN cached 1h (public, s-maxage=3600, stale-while-revalidate=3600)",
      video: "/api/video/* (detail, stream, comments) — pre-signed stream URLs (~1h validity), CDN cached 300s",
      never: "/api/csrf-token and /api/video/:id/download-link — no-store (session-bound, must not be shared)",
      proxy: "/api/proxy/image — CDN cached 24h (public, s-maxage=86400, stale-while-revalidate=86400)",
    },
  });
}