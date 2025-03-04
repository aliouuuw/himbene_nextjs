import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prismaClient from "./prisma-client";
import { headers } from "next/headers";
 
export const auth = betterAuth({
    database: prismaAdapter(prismaClient, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: true,
          defaultValue: "COMMERCIAL",
          input: false,
        },
        passwordChangeRequired: {
          type: "boolean",
          input: false,
        },
      },
    },
});

export const getAuthenticatedUserFromDb = async () => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) return null;
    return await prismaClient.user.findUnique({ where: { id: session.user.id } });
};

export const getAuthenticatedUsersAccount = async () => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) return null;
    
    // Find the account using the user's id instead of accountId
    return await prismaClient.account.findFirst({ 
      where: { 
        userId: session.user.id,
        providerId: 'credentials'
      } 
    });
};

export const isAdmin = async () => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) return false;
    const user = await prismaClient.user.findUnique({ where: { id: session.user.id } });
    return user?.role === "ADMIN";
};

export const signOut = async () => {
    await auth.api.signOut({
      headers: await headers(),
    });
};

