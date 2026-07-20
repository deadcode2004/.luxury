import { NextResponse } from "next/server";
import { CACHE_PRIVATE_NO_STORE } from "@/lib/build/cachePolicy";

export const dynamic = "force-dynamic";

function json(data: Record<string, string>) {
  return NextResponse.json(data, {
    headers: {
      // Browser must not reuse geo JSON across sessions; upstream ipapi may use Data Cache.
      "Cache-Control": CACHE_PRIVATE_NO_STORE,
      Pragma: "no-cache",
    },
  });
}

export async function GET(request: Request) {
  const headers = request.headers;
  const country =
    headers.get("x-vercel-ip-country") ||
    headers.get("cf-ipcountry") ||
    headers.get("x-country-code") ||
    "";

  if (country && country !== "XX") {
    return json({ country: country.toUpperCase(), source: "edge" });
  }

  try {
    const ip =
      headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headers.get("x-real-ip") ||
      "";
    const endpoint = ip
      ? `https://ipapi.co/${ip}/country_code/`
      : "https://ipapi.co/country_code/";
    // Server Data Cache only for the third-party lookup (not the browser response).
    const res = await fetch(endpoint, {
      headers: { "User-Agent": "paradise-luxury/1.0" },
      next: { revalidate: 86400 },
    });
    const text = (await res.text()).trim().toUpperCase();
    if (/^[A-Z]{2}$/.test(text)) {
      return json({ country: text, source: "ipapi" });
    }
  } catch {
    // fall through
  }

  return json({ country: "SA", source: "fallback" });
}
