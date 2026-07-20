import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAppBuildId } from "@/lib/build/id";

const AUTH_COOKIE = "paradise_auth";
const ROLE_COOKIE = "paradise_role";

function applyNoStoreHeaders(response: NextResponse): NextResponse {
  response.headers.set(
    "Cache-Control",
    "private, no-store, no-cache, must-revalidate, max-age=0"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  // Prevent Vercel/CDN edge from retaining HTML/RSC payloads across deploys.
  response.headers.set("CDN-Cache-Control", "no-store");
  response.headers.set("Vercel-CDN-Cache-Control", "no-store");
  response.headers.set("Surrogate-Control", "no-store");
  response.headers.set("X-Paradise-Build", getAppBuildId());
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthed = request.cookies.get(AUTH_COOKIE)?.value === "1";
  const role = request.cookies.get(ROLE_COOKIE)?.value;

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isAccount = pathname.startsWith("/account");
  const isCheckout = pathname.startsWith("/checkout");
  const isAdmin = pathname.startsWith("/admin");

  if (isAuthPage && isAuthed) {
    return applyNoStoreHeaders(
      NextResponse.redirect(new URL(role === "owner" ? "/admin" : "/account", request.url))
    );
  }

  if ((isAccount || isCheckout) && !isAuthed) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return applyNoStoreHeaders(NextResponse.redirect(url));
  }

  if (isAdmin) {
    if (!isAuthed) {
      const url = new URL("/login", request.url);
      url.searchParams.set("next", pathname);
      return applyNoStoreHeaders(NextResponse.redirect(url));
    }
    if (role !== "owner") {
      return applyNoStoreHeaders(NextResponse.redirect(new URL("/account", request.url)));
    }
  }

  // Documents, RSC payloads, and app routes must never be served from browser/CDN HTTP cache.
  // Hashed `/_next/static/*` assets are excluded via matcher and keep immutable caching.
  return applyNoStoreHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - Next hashed static assets (safe to cache forever)
     * - image optimizer
     * - common public file extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff|woff2)$).*)",
  ],
};
