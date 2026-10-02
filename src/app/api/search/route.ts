import { NextResponse, type NextRequest } from "next/server";
import { search } from "@/lib/scraper";
import { apiJson, badRequest, parsePage } from "@/lib/http";

const MAX_QUERY_LENGTH = 120;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get("q");
    const query = rawQuery?.trim() ?? "";

    if (!query) {
      return badRequest('Query parameter "q" is required');
    }
    // Bound the term so this stays a search endpoint rather than an
    // arbitrary-length reflector into the upstream request.
    if (query.length > MAX_QUERY_LENGTH) {
      return badRequest(
        `Query must be ${MAX_QUERY_LENGTH} characters or fewer`
      );
    }

    const page = parsePage(searchParams.get("page"));
    const result = await search(query, page);
    return apiJson(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}