"use server";

import { cookies } from "next/headers";

export async function storeToken(authToken: string): Promise<boolean> {
  const cookieStore = await cookies();
  try {
    if (authToken) {
      cookieStore.set("auth_token", authToken, {
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
    }
    return true;
  } catch (error) {
    console.error("Error storing token:", error);
    return false;
  }
}
