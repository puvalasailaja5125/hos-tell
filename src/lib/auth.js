import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing. Add it to your .env file.");
}
const COOKIE_NAME = "session";

export const hashPassword = (password) => bcrypt.hash(password, 10);
export const verifyPassword = (password, hash) => bcrypt.compare(password, hash);

export async function createSession(user) {
  const token = await new SignJWT({ role: user.role, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return { userId: payload.sub, role: payload.role, name: payload.name };
  } catch {
    return null; // expired or tampered token
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// For pages: send the user away if they are not allowed
export async function requireRole(role) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== role) redirect("/dashboard");
  return session;
}

// For API routes: return an error response if they are not allowed
export async function requireApiRole(role) {
  const session = await getSession();
  if (!session) {
    return { error: Response.json({ error: "Not logged in." }, { status: 401 }) };
  }
  if (session.role !== role) {
    return { error: Response.json({ error: "Forbidden." }, { status: 403 }) };
  }
  return { session };
}