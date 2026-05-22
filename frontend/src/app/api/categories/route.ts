import { NextResponse } from "next/server";
import { getCategories } from "@/lib/scraper";

export async function GET() {
  try {
    const result = await getCategories();
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
