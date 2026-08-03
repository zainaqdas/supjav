import { NextResponse, type NextRequest } from "next/server";
import { getComments } from "@/lib/scraper";
import { apiJson } from "@/lib/http";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await getComments(id);
    return apiJson(result, "video");
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
