import { NextRequest, NextResponse } from "next/server";

// Proxy images from javtiful.com to avoid CORS/referer blocking in the browser.
// Usage: /api/proxy/image?url=https://javtiful.com/uploads/...
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  // Only allow proxying from known domains
  const allowedDomains = [
    "javtiful.com",
    "r2.cloudflarestorage.com",
  ];
  try {
    const parsed = new URL(url);
    const isAllowed = allowedDomains.some(
      (domain) => parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
    );
    if (!isAllowed) {
      return NextResponse.json(
        { error: "Proxying from this domain is not allowed" },
        { status: 403 }
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        Accept: "image/*",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream returned ${response.status}` },
        { status: 502 }
      );
    }

    const contentType =
      response.headers.get("content-type") || "image/jpeg";
    const body = await response.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
    });
  } catch (_err) {
    return NextResponse.json(
      { error: "Failed to fetch image from upstream" },
      { status: 502 }
    );
  }
}
