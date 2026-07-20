import { NextResponse } from "next/server";
import { getAppBuildId } from "@/lib/build/id";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Public build stamp so clients can detect a newer deploy and hard-reload. */
export async function GET() {
  return NextResponse.json(
    {
      buildId: getAppBuildId(),
      generatedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}
