import { NextResponse, type NextRequest } from "next/server";
import { getVideoDetail } from "@/lib/scraper";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const detail = await getVideoDetail(id);
    return NextResponse.json({
      id: detail.id,
      title: detail.title,
      streams: detail.streams,
      qualityOptions: detail.qualityOptions,
      defaultQuality: detail.defaultQuality,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
