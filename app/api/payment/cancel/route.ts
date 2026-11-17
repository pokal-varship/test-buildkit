import { NextRequest, NextResponse } from "next/server";
import { RAZORPAY_ORDER_CANCEL_ENDPOINT } from "@config/api.config";

/**
 * Same-origin proxy → POST /e-commerce/v1/order/cancel (avoids browser CORS).
 */
export async function POST(request: NextRequest) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

  if (!apiBase) {
    return NextResponse.json(
      { error: "API URL is not configured" },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? "";
  const token = request.cookies.get("token")?.value;
  const authHeader = request.headers.get("authorization");
  const storeId = request.headers.get("store-id");
  const userLocation = request.headers.get("x-user-location");

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "Tenant-Id": tenantId,
  };

  if (authHeader) {
    headers.Authorization = authHeader.startsWith("Bearer ")
      ? authHeader
      : `Bearer ${authHeader}`;
  } else if (token) {
    headers.Authorization = token.startsWith("Bearer ")
      ? token
      : `Bearer ${token}`;
  }

  if (storeId) {
    headers["Store-Id"] = storeId;
  }

  if (userLocation) {
    headers["X-User-Location"] = userLocation;
  }

  try {
    const upstream = await fetch(
      `${apiBase}${RAZORPAY_ORDER_CANCEL_ENDPOINT}`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      }
    );

    const data = await upstream.json().catch(() => ({}));

    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to cancel payment order",
      },
      { status: 502 }
    );
  }
}
