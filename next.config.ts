import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent workspace root inference warning from parent lockfile
  turbopack: {
    root: __dirname,
  },
  // CDN-cache page HTML. The proxy can't set Cache-Control on pass-through
  // responses (Next.js overwrites it for dynamic routes), so we do it here.
  // Video pages cache only 300s because their stream URLs are pre-signed
  // (~1h validity). API routes set their own headers in src/lib/http.ts.
  async headers() {
    return [
      {
        source: "/video/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=300, stale-while-revalidate=300",
          },
        ],
      },
      {
        source:
          "/((?!api/|_next/|video/|favicon\\.ico$|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|txt|xml)$).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=3600",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
