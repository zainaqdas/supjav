import { NextResponse, type NextRequest } from "next/server";
import { getReducingMosaic } from "@/lib/scraper";
import { apiJson, parsePage, parseSort, LISTING_SORTS } from "@/lib/http";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parsePage(searchParams.get("page"));
    const sort = parseSort(searchParams.get("sort"), LISTING_SORTS);
    const result = await getReducingMosaic(page, sort);
    return apiJson(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}