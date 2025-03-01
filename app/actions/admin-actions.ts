'use server'

import prismaClient from "@/lib/prisma-client";
import { getAuthenticatedUserFromDb, isAdmin } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

interface CreateUserData {
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
}

export async function createUser(data: CreateUserData) {
  const currentUser = await getAuthenticatedUserFromDb();
  
  if (!isAdmin(currentUser)) {
    throw new Error('Unauthorized: Admin access required');
  }

  try {
    // Send invitation via Clerk API first
    const response = await fetch('https://api.clerk.com/v1/invitations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: data.email,
        public_metadata: {
          role: data.role,
          firstName: data.firstName,
          lastName: data.lastName,
          pendingDbCreation: true
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send invitation');
    }

    // Instead of creating the user immediately, we'll store the pending invitation
    const pendingUser = await prismaClient.pendingUser.create({
      data: {
        email: data.email,
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
      }
    });

    revalidatePath('/admin/users');
    return { success: true, data: pendingUser };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: 'Failed to create user' };
  }
}

export async function getUsers() {
  const currentUser = await getAuthenticatedUserFromDb();
  
  if (!isAdmin(currentUser)) {
    throw new Error('Unauthorized: Admin access required');
  }

  return await prismaClient.user.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function createBrand(name: string) {
  const currentUser = await getAuthenticatedUserFromDb();
  
  if (!isAdmin(currentUser)) {
    throw new Error('Unauthorized: Admin access required');
  }

  return await prismaClient.brand.create({
    data: {
      name: name,
    },
  });
}

export async function getBrands() {
  const currentUser = await getAuthenticatedUserFromDb();
  
  if (!isAdmin(currentUser)) {
    throw new Error('Unauthorized: Admin access required');
  }

  return await prismaClient.brand.findMany();
} 

export async function deleteBrand(brandId: string) {
  const currentUser = await getAuthenticatedUserFromDb();
  
  if (!isAdmin(currentUser)) {
    throw new Error('Unauthorized: Admin access required');
  }

  return await prismaClient.brand.delete({
    where: { id: brandId },
  });
}

export async function updateBrand(brandId: string, name: string) {
  const currentUser = await getAuthenticatedUserFromDb();
  
  if (!isAdmin(currentUser)) {
    throw new Error('Unauthorized: Admin access required');
  }

  return await prismaClient.brand.update({
    where: { id: brandId },
    data: { name: name },
  });
}





