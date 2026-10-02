import { NextResponse, type NextRequest } from "next/server";
import { getDownloadLink } from "@/lib/scraper";
import { apiJson, badRequest, isValidVideoId } from "@/lib/http";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!isValidVideoId(id)) {
      return badRequest("Invalid video id");
    }
    // No client-supplied CSRF token: the upstream token is acquired
    // server-side, so this cannot be used as a generic POST relay.
    const result = await getDownloadLink(id);
    // Never CDN-cache: the response is bound to a freshly minted upstream
    // session, so a shared cache entry would serve a dead/foreign session.
    return apiJson(result, "none");
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}