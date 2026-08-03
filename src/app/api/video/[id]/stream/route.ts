import { NextResponse, type NextRequest } from "next/server";
import { getVideoDetail } from "@/lib/scraper";
import { apiJson } from "@/lib/http";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const detail = await getVideoDetail(id);
    return apiJson({
      id: detail.id,
      title: detail.title,
      streams: detail.streams,
      qualityOptions: detail.qualityOptions,
      defaultQuality: detail.defaultQuality,
    }, "video");
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
