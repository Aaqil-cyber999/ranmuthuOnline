import { NextResponse } from "next/server";
import { getAdminSession } from "./session";
import { hasPermission, type AdminPermission } from "./permissions";
import type { AdminPayload } from "./jwt";

export async function requireAdmin(): Promise<AdminPayload | NextResponse> {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}

export async function requirePermission(
  permission: AdminPermission
): Promise<AdminPayload | NextResponse> {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission(session.role, permission)) {
    return NextResponse.json(
      { error: "You do not have permission to perform this action" },
      { status: 403 }
    );
  }
  return session;
}
