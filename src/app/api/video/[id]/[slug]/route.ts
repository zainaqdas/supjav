import { NextResponse, type NextRequest } from "next/server";
import { getVideoDetail } from "@/lib/scraper";
import {
  apiJson,
  badRequest,
  isValidSlug,
  isValidVideoId,
} from "@/lib/http";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; slug: string }> }
) {
  try {
    const { id, slug } = await params;
    if (!isValidVideoId(id)) {
      return badRequest("Invalid video id");
    }
    if (!isValidSlug(slug)) {
      return badRequest("Invalid video slug");
    }
    const result = await getVideoDetail(id, slug);
    return apiJson(result, "video");
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}