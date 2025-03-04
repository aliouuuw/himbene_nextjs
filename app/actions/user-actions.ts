"use server"

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PrismaClient, UserRole } from "@prisma/client"
import prismaClient from "@/lib/prisma-client";

const prisma = new PrismaClient()

export const getUserRole = async (userId: string): Promise<UserRole | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })
  // console.log("IN USER ACTIONS, user role:", user?.role)
  return user?.role as UserRole | null
}

export const getAuthenticatedUserRole = async (): Promise<UserRole | null> => {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session) return null;
  // console.log("IN USER ACTIONS, userId:", session.user.id)
  return getUserRole(session.user.id)
}

export async function updatePassword(newPassword: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.email) {
      return { success: false, error: 'Not authenticated' };
    }
    
    // Find the user account
    const account = await prismaClient.account.findFirst({
      where: {
        accountId: session.user.email,
        providerId: 'credentials'
      }
    });
    
    if (!account) {
      return { success: false, error: 'Account not found' };
    }
    
    // Update the password and set passwordChangeRequired to false
    await prismaClient.account.update({
      where: { id: account.id },
      data: {
        password: newPassword, // In production, hash this password
        passwordChangeRequired: false
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating password:', error);
    return { success: false, error: 'Failed to update password' };
  }
}