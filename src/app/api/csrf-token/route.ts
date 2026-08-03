import { NextResponse } from "next/server";
import { getCsrfToken } from "@/lib/scraper";
import { apiJson } from "@/lib/http";

export async function GET() {
  try {
    const result = await getCsrfToken();
    return apiJson(result, "none");
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
