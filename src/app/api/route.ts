import { apiJson } from "@/lib/http";

export async function GET() {
  return apiJson({
    name: "Supjav Scraper API",
    version: "2.1.0",
    baseUrl: "https://javtiful.com",
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
      proxyImage: "/api/proxy/image?url=<encoded javtiful.com or r2.cloudflarestorage.com URL>",
      csrfToken: "/api/csrf-token",
    },
    queryParams: {
      page: "Page number for paginated results (default: 1)",
      q: "Search query (for /api/search)",
      sort: [
        "Video listings (/api/videos, /api/censored, /api/uncensored, /api/reducing-mosaic): added_today, added_week, added_month, most_liked, most_viewed, popular_today, popular_week, popular_month",
        "Entity pages (/api/category/:slug, /api/actress/:slug, /api/channel/:slug): popular, added_today, added_week, added_month — the source only honors these values there",
      ],
    },
    caching: {
      hour: "Listings, entity pages & docs — CDN cached 1h (public, s-maxage=3600, stale-while-revalidate=3600)",
      video: "/api/video/* (detail, stream, comments, download-link) — pre-signed stream URLs (~1h validity), CDN cached 300s",
      never: "/api/csrf-token — never cached",
      proxy: "/api/proxy/image — CDN cached 24h (public, s-maxage=86400, stale-while-revalidate=86400)",
    },
  });
}
