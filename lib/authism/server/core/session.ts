"use server";
import { cookies } from "next/headers";
import { User, Session } from "../../shared/types";
import { createToken, verifyToken, SESSION_DURATION } from "./tokens";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export async function setCookie(name: string, value: string, options: Partial<ResponseCookie>) {
  const cookieStore = await cookies();
  cookieStore.set({
    name,
    value,
    ...options
  });
}

// Get the current session from cookies
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) return null;

  return verifyToken(token);
}

// Get the current user from the session
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  return session?.user || null;
}

// Create a new session
export async function createSession(user: User): Promise<string> {
  const expires = new Date(Date.now() + SESSION_DURATION);
  const session: Session = { user, expires };
  return createToken(session);
} 