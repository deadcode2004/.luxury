import { NextResponse } from "next/server";
import { getAppBuildId } from "@/lib/build/id";
import { CACHE_PRIVATE_NO_STORE } from "@/lib/build/cachePolicy";

export const dynamic = "force-dynamic";

/** Deploy stamp for open tabs — must never be cached. */
export async function GET() {
  return NextResponse.json(
    {
      buildId: getAppBuildId(),
      generatedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": CACHE_PRIVATE_NO_STORE,
        Pragma: "no-cache",
      },
    }
  );
}
