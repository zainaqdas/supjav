import { NextResponse } from "next/server";
import { getCsrfToken } from "@/lib/scraper";

export async function GET() {
  try {
    const result = await getCsrfToken();
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
