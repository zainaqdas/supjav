import { NextResponse, type NextRequest } from "next/server";
import { getDownloadLink } from "@/lib/scraper";
import { apiJson } from "@/lib/http";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const csrfToken = request.headers.get("x-csrf-token") || undefined;
    const result = await getDownloadLink(id, csrfToken);
    return apiJson(result, "video");
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
