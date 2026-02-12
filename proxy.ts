import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const authProxy = withAuth({
  pages: {
    signIn: "/login",
  },
});

export const proxy = (request: Request, event: { waitUntil: (promise: Promise<unknown>) => void }) => {
  if (process.env.NODE_ENV !== "production" || process.env.E2E_BYPASS_AUTH === "true") {
    return NextResponse.next();
  }

  return authProxy(request as never, event as never);
};

export const config = {
  matcher: ["/dashboard/:path*", "/factories/:path*", "/users/:path*", "/menus/:path*", "/admin/:path*", "/crud/:path*"],
};
