import { NextRequest, NextResponse } from "next/server";

const USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

function isAllowedVideoUrl(value: string) {
  try {
    const { hostname } = new URL(value);
    return (
      hostname === "javtiful.com" ||
      hostname.endsWith(".javtiful.com") ||
      hostname === "r2.cloudflarestorage.com" ||
      hostname.endsWith(".r2.cloudflarestorage.com")
    );
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url || !isAllowedVideoUrl(url)) {
    return NextResponse.json({ error: "Invalid video URL" }, { status: 400 });
  }

  const range = request.headers.get("range");
  const headers: Record<string, string> = {
    "User-Agent": USER_AGENT,
    Accept: "video/*,application/octet-stream;q=0.9,*/*;q=0.8",
  };
  if (range) headers.Range = range;

  try {
    const upstream = await fetch(url, { headers });
    if (!upstream.ok && upstream.status !== 206) {
      return NextResponse.json(
        { error: `Upstream returned ${upstream.status}` },
        { status: 502 }
      );
    }

    const responseHeaders = new Headers();
    for (const name of [
      "content-type",
      "content-length",
      "content-range",
      "accept-ranges",
    ]) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    responseHeaders.set("Cache-Control", "private, no-store");
    responseHeaders.set("Access-Control-Allow-Origin", "*");

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch video from upstream" },
      { status: 502 }
    );
  }
}

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Range",
    },
  });
}
