import { auth } from "@clerk/nextjs/server";
import prismaClient from "@/lib/prisma-client";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

export async function getAuthenticatedUserFromDb() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  // Check if user exists in database
  const dbUser = await prismaClient.user.findUnique({
    where: { id: userId },
  });

  // console.log("IN AUTH, dbUser:", dbUser)

  return dbUser;
}

// Alternative function that takes a userId directly instead of using currentUser()
export async function getUserById(userId: string) {
  if (!userId) {
    return null;
  }

  // Check if user exists in database
  const dbUser = await prismaClient.user.findUnique({
    where: { id: userId },
  });

  // If user doesn't exist, return null - user should be created elsewhere
  if (!dbUser) {
    return null;
  }

  return dbUser;
}

// Role checking utilities
export function hasRole(user: { role: UserRole } | null, ...roles: UserRole[]) {
  return user != null && roles.includes(user.role);
}

export function isAdmin(user: { role: UserRole } | null) {
  return hasRole(user, 'ADMIN');
}

export function isInfographe(user: { role: UserRole } | null) {
  return hasRole(user, 'INFOGRAPHE');
}

export function isCommercial(user: { role: UserRole } | null) {
  return hasRole(user, 'COMMERCIAL');
}

// Role protection for use in route handlers
export async function requireRole(roles: UserRole[]) {
  const user = await getAuthenticatedUserFromDb();
  
  if (!user) {
    console.log("You are being redirected to sign-in")
    redirect("/sign-in");
  }
  
  if (!hasRole(user, ...roles)) {
    throw new Error("Access denied. You don't have the required role.");
  }
  
  return user;
}

// Specific role protection helpers
export async function requireAdmin() {
  return requireRole(['ADMIN']);
}

export async function requireInfographe() {
  return requireRole(['INFOGRAPHE']);
}

export async function requireCommercial() {
  return requireRole(['COMMERCIAL']);
}