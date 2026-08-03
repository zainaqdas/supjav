import { apiJson } from "@/lib/http";

export async function GET() {
  return apiJson({
    name: "Supjav Scraper API",
    version: "2.0.0",
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
      csrfToken: "/api/csrf-token",
    },
    queryParams: {
      page: "Page number for paginated results (default: 1)",
      q: "Search query (for /api/search)",
      sort: "Sort order for /api/videos (added_today, added_week, added_month, most_liked, most_viewed, popular_today, popular_week, popular_month)",
    },
  });
}
