import { NextRequest, NextResponse } from "next/server";

// Proxy images from the source site to avoid CORS/referer blocking in the browser.
// Usage: /api/proxy/image?url=https://javtiful.com/uploads/...

// Only these hosts may be proxied. Both are user-upload surfaces, which is why
// the response below never trusts the upstream Content-Type.
const ALLOWED_DOMAINS = ["javtiful.com", "r2.cloudflarestorage.com"];

// Hard cap on the buffered body. Upstream is untrusted: without this an
// arbitrarily large file would be pulled fully into memory by arrayBuffer().
const MAX_BYTES = 10 * 1024 * 1024; // 10MB

const FETCH_TIMEOUT_MS = 10_000;

function error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return error("Missing url parameter", 400);
  }

  // Validate scheme + host before any network call.
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return error("Invalid URL", 400);
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return error("Only http and https URLs are allowed", 400);
  }

  const hostname = parsed.hostname.toLowerCase();
  const isAllowed = ALLOWED_DOMAINS.some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
  );
  if (!isAllowed) {
    return error("Proxying from this domain is not allowed", 403);
  }

  let response: Response;
  try {
    response = await fetch(parsed.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        Accept: "image/*",
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch {
    return error("Failed to fetch image from upstream", 502);
  }

  if (!response.ok) {
    return error(`Upstream returned ${response.status}`, 502);
  }

  // Reject non-images before reading the body. The upstream hosts let users
  // upload arbitrary files; reflecting their Content-Type here would let a
  // stored `text/html` execute as first-party script on our origin.
  const upstreamType = (response.headers.get("content-type") || "")
    .split(";")[0]
    .trim()
    .toLowerCase();
  if (upstreamType && !upstreamType.startsWith("image/")) {
    return error("Upstream resource is not an image", 415);
  }

  // Enforce the size cap via the declared length first (cheap rejection).
  const declaredLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BYTES) {
    return error("Upstream image is too large", 413);
  }

  let body: ArrayBuffer;
  try {
    body = await response.arrayBuffer();
  } catch {
    return error("Failed to fetch image from upstream", 502);
  }

  // Re-check after buffering in case content-length was absent or lying.
  if (body.byteLength > MAX_BYTES) {
    return error("Upstream image is too large", 413);
  }

  // Serve the sniffed-or-declared image type, never the raw upstream header.
  const contentType = upstreamType || "image/jpeg";

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(body.byteLength),
      // Defends against content sniffing even if the type above is unusual.
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Cache-Control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    },
  });
}