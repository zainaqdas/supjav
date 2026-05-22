import { NextResponse, type NextRequest } from "next/server";
import { getVideoDetail } from "@/lib/scraper";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; slug: string }> }
) {
  try {
    const { id, slug } = await params;
    const result = await getVideoDetail(id, slug);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
