import { NextResponse } from "next/server";
import { getAdminSession } from "./session";
import type { AdminPayload } from "./jwt";

export async function requireAdmin(): Promise<AdminPayload | NextResponse> {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}
