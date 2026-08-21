import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default-secret-change-me"
);

if (!process.env.JWT_SECRET) {
  console.warn("[AUTH] WARNING: JWT_SECRET env var is not set. Using insecure default. Set JWT_SECRET in production!");
}

const COOKIE_NAME = "admin_token";

export interface AdminPayload {
  id: string;
  email: string;
}

export async function signToken(payload: AdminPayload): Promise<string> {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AdminPayload;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function setAuthCookie(token: string) {
  return {
    "Set-Cookie": `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=86400; ${process.env.NODE_ENV === "production" ? "Secure;" : ""}`,
  };
}

export function clearAuthCookie() {
  return {
    "Set-Cookie": `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0;`,
  };
}
