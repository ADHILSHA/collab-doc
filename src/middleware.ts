import { NextRequest, NextResponse } from "next/server";
import { CURRENT_USER_COOKIE } from "@/lib/session";

export function middleware(request: NextRequest) {
  const hasSession = request.cookies.has(CURRENT_USER_COOKIE);
  if (!hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/documents/:path*"],
};
