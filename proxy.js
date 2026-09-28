import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const deptRoles = ["it", "security", "finance", "manager"];

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    if (!token) return NextResponse.next();

    // Admin area
    if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
      if (token.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Department area
    if (pathname.startsWith("/dept/")) {
      const segments = pathname.split("/"); // ["", "dept", "it", "dashboard"]
      const urlDept = segments[2];

      if (!deptRoles.includes(token.role)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      // Prevent cross-department access
      if (urlDept && urlDept !== token.role) {
        return NextResponse.redirect(
          new URL(`/dept/${token.role}/dashboard`, req.url)
        );
      }
    }

    // Employee area
    if (pathname.startsWith("/dashboard")) {
      if (deptRoles.includes(token.role) || token.role === "admin") {
        const target =
          token.role === "admin"
            ? "/admin/dashboard"
            : `/dept/${token.role}/dashboard`;
        return NextResponse.redirect(new URL(target, req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        const publicPaths = [
          "/",
          "/login",
          "/signup",
          "/signout",
          "/admin/login",
          "/dept/it/login",
          "/dept/security/login",
          "/dept/finance/login",
          "/dept/manager/login",
        ];

        if (publicPaths.includes(pathname)) return true;
        if (pathname.startsWith("/api/auth")) return true;
        if (pathname.startsWith("/invite")) return true; // for future invite links

        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/dept/:path*"],
};