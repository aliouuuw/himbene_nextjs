import { SignJWT, jwtVerify } from "jose";
import { Session } from "../../shared/types";

// Environment variables should be used for secrets in production
const JWT_SECRET = process.env.JWT_SECRET || "your-development-secret-key";
const key = new TextEncoder().encode(JWT_SECRET);

// Session duration
export const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Create a JWT token
export async function createToken(session: Session): Promise<string> {
  return await new SignJWT({ session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(new Date(Date.now() + SESSION_DURATION))
    .sign(key);
}

// Verify and decode a JWT token
export async function verifyToken(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });
    return payload.session as Session;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
} 