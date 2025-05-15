import { redirect } from "next/navigation";
import { AuthProviderInterface, LoginResult } from "../../shared/types";
import { getCurrentUser } from "./session";
import { createSession, setCookie } from "./session";
import { SESSION_DURATION } from "./tokens";

// Server action for login
export async function login(
  authProvider: AuthProviderInterface,
  email: string, 
  password: string
): Promise<LoginResult> {
  try {
    // Validate inputs
    if (!email || !password) {
      return { success: false, error: "Email and password are required" };
    }

    // Get user from provider
    const user = await authProvider.getUserByEmail(email);
    if (!user) {
      return { success: false, error: "Invalid credentials" };
    }

    // Validate password
    const isValid = await authProvider.validatePassword(user, password);
    if (!isValid) {
      return { success: false, error: "Invalid credentials" };
    }

    // Create session
    const token = await createSession(user);

    await setCookie("session", token, {
      maxAge: Math.floor(SESSION_DURATION / 1000), // Convert milliseconds to seconds
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return { success: true, user };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "An error occurred during login" };
  }
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}

// Check if user is admin
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user && user.role === "admin";
}

// Check if user is a user
export async function isUser(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user && user.role === "user";
}

// Helper functions for route protection in server components
export async function requireAuth() {
  const isAuthed = await isAuthenticated();
  if (!isAuthed) {
    redirect("/admin/login");
  }
}

export async function requireAdmin() {
  const admin = await isAdmin();
  const user = await isUser();
  if (!admin) {
    if (user) {
      redirect("/user");
    } else {
      redirect("/admin/login");
    }
  }
} 