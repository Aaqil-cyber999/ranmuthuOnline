import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db/prisma";
import { signToken } from "@/lib/security/jwt";
import { setAuthCookie, getAdminSession, clearAuthCookie } from "@/lib/security/session";
import { rateLimit, getClientIp } from "@/lib/security/rateLimit";
import type { AdminRole } from "@/lib/security/permissions";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { allowed, response: rlResponse } = rateLimit(`login:${ip}`, { maxRequests: 5, windowMs: 15 * 60_000 });
    if (!allowed) return rlResponse!;

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await signToken({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role as AdminRole,
    });
    const response = NextResponse.json({
      success: true,
      admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
    });

    const cookies = setAuthCookie(token);
    response.headers.set("Set-Cookie", cookies["Set-Cookie"]);
    return response;
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    return NextResponse.json({ admin: session });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const response = NextResponse.json({ success: true });
    const cookies = clearAuthCookie();
    response.headers.set("Set-Cookie", cookies["Set-Cookie"]);
    return response;
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
