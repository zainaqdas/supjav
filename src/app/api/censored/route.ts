import { NextResponse, type NextRequest } from "next/server";
import { getCensored } from "@/lib/scraper";
import { apiJson } from "@/lib/http";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const sort = searchParams.get("sort") || undefined;
    const result = await getCensored(page, sort);
    return apiJson(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
