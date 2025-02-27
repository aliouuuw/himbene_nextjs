"use server"

import { auth } from "@clerk/nextjs/server"
import { PrismaClient, UserRole } from "@prisma/client"

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
  const { userId } = await auth()
  // console.log("IN USER ACTIONS, userId:", userId)
  return getUserRole(userId ?? "")
}