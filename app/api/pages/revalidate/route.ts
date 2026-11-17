import { NextRequest, NextResponse } from "next/server";
import { revalidatePublishedPage } from "lib/revalidatePublishedPage";
import { validateToken } from "lib/tokenValidation";

function extractToken(request: NextRequest, body: { token?: string }): string | null {
  const header = request.headers.get("authorization");
  if (header?.trim()) {
    return header.replace(/^Bearer\s+/i, "").trim();
  }
  if (typeof body.token === "string" && body.token.trim()) {
    return body.token.trim();
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      pagePath?: string;
      token?: string;
    };

    const token = extractToken(request, body);
    if (!validateToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!body.pagePath || typeof body.pagePath !== "string") {
      return NextResponse.json(
        { error: "pagePath is required" },
        { status: 400 },
      );
    }

    const revalidated = revalidatePublishedPage(body.pagePath);

    return NextResponse.json({
      success: true,
      revalidated,
      skipped: revalidated.length === 0,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to revalidate page" },
      { status: 500 },
    );
  }
}
