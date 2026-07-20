import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const headers = request.headers;
  const country =
    headers.get("x-vercel-ip-country") ||
    headers.get("cf-ipcountry") ||
    headers.get("x-country-code") ||
    "";

  if (country && country !== "XX") {
    return NextResponse.json({ country: country.toUpperCase(), source: "edge" });
  }

  try {
    const ip =
      headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headers.get("x-real-ip") ||
      "";
    const endpoint = ip
      ? `https://ipapi.co/${ip}/country_code/`
      : "https://ipapi.co/country_code/";
    const res = await fetch(endpoint, {
      headers: { "User-Agent": "paradise-luxury/1.0" },
      next: { revalidate: 86400 },
    });
    const text = (await res.text()).trim().toUpperCase();
    if (/^[A-Z]{2}$/.test(text)) {
      return NextResponse.json({ country: text, source: "ipapi" });
    }
  } catch {
    // fall through
  }

  return NextResponse.json({ country: "SA", source: "fallback" });
}
