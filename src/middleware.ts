import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "paradise_auth";
const ROLE_COOKIE = "paradise_role";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthed = request.cookies.get(AUTH_COOKIE)?.value === "1";
  const role = request.cookies.get(ROLE_COOKIE)?.value;

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isAccount = pathname.startsWith("/account");
  const isCheckout = pathname.startsWith("/checkout");
  const isAdmin = pathname.startsWith("/admin");

  if (isAuthPage && isAuthed) {
    return NextResponse.redirect(new URL(role === "owner" ? "/admin" : "/account", request.url));
  }

  if ((isAccount || isCheckout) && !isAuthed) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAdmin) {
    if (!isAuthed) {
      const url = new URL("/login", request.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    if (role !== "owner") {
      return NextResponse.redirect(new URL("/account", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*", "/checkout/:path*", "/login", "/register"],
};
