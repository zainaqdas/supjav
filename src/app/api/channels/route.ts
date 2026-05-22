import { NextResponse } from "next/server";
import { getChannels } from "@/lib/scraper";

export async function GET() {
  try {
    const result = await getChannels();
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
