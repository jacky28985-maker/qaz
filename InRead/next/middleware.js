import { NextResponse } from "next/server";

export function middleware(request) {
  if (!request.cookies.get("inread_session")?.value) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/legacy/:path*", "/reader"] };
