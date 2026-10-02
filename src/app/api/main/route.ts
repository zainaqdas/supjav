import { NextResponse, type NextRequest } from "next/server";
import { getMain } from "@/lib/scraper";
import { apiJson, parsePage } from "@/lib/http";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parsePage(searchParams.get("page"));
    const result = await getMain(page);
    return apiJson(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}