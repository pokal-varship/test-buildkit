import { NextResponse } from "next/server";
import {
  clearGuestTokenCache,
  fetchGuestTokenServer,
} from "@services/guestToken";

export async function GET() {
  try {
    const token = await fetchGuestTokenServer();

    if (!token) {
      return NextResponse.json(
        { error: "No token received from authentication service" },
        { status: 500 },
      );
    }

    return NextResponse.json({ token });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  clearGuestTokenCache();
  return NextResponse.json({ message: "Guest token cache invalidated" });
}
