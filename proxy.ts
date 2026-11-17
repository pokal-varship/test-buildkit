import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  // Handle /edit routes - rewrite them to the puck editor
  if (request.nextUrl.pathname.endsWith("/edit")) {
    const path = request.nextUrl.pathname.replace("/edit", "");
    
    // Special handling for homepage editing
    if (path === "" || path === "/") {
      const url = new URL(`/pages/puck/`, request.url);
      // Preserve query parameters (including token)
      url.search = request.nextUrl.search;
      return NextResponse.rewrite(url);
    }
    
    // For other pages, use the existing logic
    const url = new URL(`/pages/puck${path}`, request.url);
    // Preserve query parameters (including token)
    url.search = request.nextUrl.search;
    return NextResponse.rewrite(url);
  }

  // Continue to the normal request handling
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}; 