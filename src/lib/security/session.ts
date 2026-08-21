import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, SESSION_MAX_AGE, verifyToken, type AdminPayload } from "./jwt";

export async function getAdminSession(): Promise<AdminPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function setAuthCookie(token: string) {
  return {
    "Set-Cookie": `${AUTH_COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}; ${process.env.NODE_ENV === "production" ? "Secure;" : ""}`,
  };
}

export function clearAuthCookie() {
  return {
    "Set-Cookie": `${AUTH_COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0;`,
  };
}
