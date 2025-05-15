"use server";

import { login } from "../core/auth";
import { getCurrentUser } from "../core/session";
import { cookies } from "next/headers";
import { memoryAuthProvider } from "../providers/memory-provider";
import { LoginResult } from "../../shared/types";

export async function loginAction(email: string, password: string): Promise<LoginResult> {
  try {
    const result = await login(memoryAuthProvider, email, password);
    return result;
  } catch (error) {
    console.error("Login action error:", error);
    return { 
      success: false, 
      error: "Internal server error" 
    };
  }
}

export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.set("session", "", {
      expires: new Date(0),
      path: "/",
    });
    
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, error: "Logout failed" };
  }
}

export async function getUserAction() {
  try {
    const user = await getCurrentUser();
    return user;
  } catch (error) {
    console.error("Get user error:", error);
    return null;
  }
} 