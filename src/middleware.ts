import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const user = request.cookies.get("savings_user");
  const hasSetup = request.cookies.get("savings_setup");
  const isLoginPage = request.nextUrl.pathname === "/login";
  const isSetupPage = request.nextUrl.pathname === "/setup";

  if (!user && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Kiểm tra xem người dùng đã setup chưa
  if (user && !hasSetup && !isLoginPage && !isSetupPage) {
    return NextResponse.redirect(new URL("/setup", request.url));
  }

  if (user && hasSetup && isSetupPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (user && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}; 