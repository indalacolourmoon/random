import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Redirect authenticated users away from /login
    if (path === "/login" && token) {
      const role = (token.role as string) || 'reviewer';
      return NextResponse.redirect(new URL(`/${role}`, req.url));
    }

    // Role-based protection
    if (path.startsWith("/admin") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (path.startsWith("/editor") && !["admin", "editor"].includes(token?.role as string)) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (path.startsWith("/reviewer") && !["admin", "editor", "reviewer"].includes(token?.role as string)) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        // Always allow access to /login so the proxy function can handle the redirect logic
        if (path === "/login") return true;
        // Require token for protected paths
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

// Matcher MUST be specific to avoid intercepting NextAuth API routes which cause CLIENT_FETCH_ERROR
export const config = {
  matcher: [
    "/admin/:path*",
    "/editor/:path*",
    "/reviewer/:path*",
    "/login",
  ],
};
