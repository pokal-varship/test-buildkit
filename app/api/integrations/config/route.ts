import { NextRequest, NextResponse } from "next/server";
import { INTEGRATIONS_CONFIG_ENDPOINT } from "@config/api.config";

/**
 * Proxies integrations config to avoid browser CORS on api.newkommerce.com.
 */
export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type") ?? "payment";
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

  if (!apiBase) {
    return NextResponse.json(
      { error: "API URL is not configured" },
      { status: 500 }
    );
  }

  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? "";
  const token = request.cookies.get("token")?.value;
  const authHeader = request.headers.get("authorization");

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "Tenant-Id": tenantId,
  };

  if (authHeader) {
    headers.Authorization = authHeader;
  } else if (token) {
    headers.Authorization = token.startsWith("Bearer ")
      ? token
      : `Bearer ${token}`;
  }

  try {
    const url = `${apiBase}${INTEGRATIONS_CONFIG_ENDPOINT}?type=${encodeURIComponent(type)}`;
    const upstream = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const body = await upstream.json().catch(() => ({}));

    return NextResponse.json(body, { status: upstream.status });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch integration config",
      },
      { status: 502 }
    );
  }
}
