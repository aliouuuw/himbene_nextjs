import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { bearer } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prismaClient from "./prisma-client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

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
        input: true,
      },
    },
  },
  plugins: [
    bearer(),
    jwt({
      jwt: {
        definePayload: (request) => {
          return {
            id: request.user.id,
            email: request.user.email,
            role: request.user.role,
          };
        },
      },
    }),
  ],
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
  try {
    const account = await prismaClient.account.findFirst({
      where: {
        userId: session.user.id,
      providerId: "credential",
      passwordChangeRequired: true,
    },
    });
    //console.log("Account:", account);
    return account;
  } catch (error) {
    console.error("Error getting authenticated users account:", error);
    return null;
  }
};

export const isAdmin = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) return false;
  const user = await prismaClient.user.findUnique({
    where: { id: session.user.id },
  });
  return user?.role === "ADMIN";
};

export const isInfographe = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) return false;
  return session.user.role === "INFOGRAPHE";
};

export const signOut = async () => {
  await auth.api.signOut({
    headers: await headers(),
  });
  redirect("/sign-in");
};
