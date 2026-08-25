import { SignJWT, jwtVerify } from "jose";
import { isAdminRole, type AdminRole } from "./permissions";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default-secret-change-me"
);

if (!process.env.JWT_SECRET) {
  console.warn("[AUTH] WARNING: JWT_SECRET env var is not set. Using insecure default. Set JWT_SECRET in production!");
}

export const AUTH_COOKIE_NAME = "admin_token";
export const SESSION_MAX_AGE = 60 * 60 * 24; // 24h

export interface AdminPayload {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

export async function signToken(payload: AdminPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (
      typeof payload.id !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string" ||
      !isAdminRole(payload.role)
    ) {
      return null;
    }
    return { id: payload.id, email: payload.email, name: payload.name, role: payload.role };
  } catch {
    return null;
  }
}
