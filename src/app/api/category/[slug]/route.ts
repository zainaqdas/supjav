import { NextResponse, type NextRequest } from "next/server";
import { getCategory } from "@/lib/scraper";
import {
  apiJson,
  badRequest,
  isValidSlug,
  parsePage,
  parseSort,
  DETAIL_SORTS,
} from "@/lib/http";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!isValidSlug(slug)) {
      return badRequest("Invalid category slug");
    }
    const { searchParams } = new URL(request.url);
    const page = parsePage(searchParams.get("page"));
    const sort = parseSort(searchParams.get("sort"), DETAIL_SORTS);
    const result = await getCategory(slug, page, sort);
    return apiJson(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}