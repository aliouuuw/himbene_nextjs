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

export async function getWigColors() {
  const currentUser = await getAuthenticatedUserFromDb();
  
  if (!isAdmin(currentUser)) {
    throw new Error('Unauthorized: Admin access required');
  }

  return await prismaClient.wigColor.findMany({
    orderBy: {
      name: 'asc',
    },
  });
}

export async function getWigSizes() {
  const currentUser = await getAuthenticatedUserFromDb();
  
  if (!isAdmin(currentUser)) {
    throw new Error('Unauthorized: Admin access required');
  }

  return await prismaClient.wigSize.findMany({
    orderBy: {
      orderIndex: 'asc',
    },
  });
}

export async function getCurrencies() {
  const currentUser = await getAuthenticatedUserFromDb();
  
  if (!isAdmin(currentUser)) {
    throw new Error('Unauthorized: Admin access required');
  }

  const currencies = await prismaClient.currency.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  // Convert Decimal to string for serialization
  return currencies.map(currency => ({
    ...currency,
    rate: currency.rate.toString(),
  }));
}

// Wig Color Actions
export async function createWigColor(name: string, hexCode?: string) {
  const currentUser = await getAuthenticatedUserFromDb();
  
  if (!isAdmin(currentUser)) {
    throw new Error('Unauthorized: Admin access required');
  }

  return await prismaClient.wigColor.create({
    data: {
      name,
      hexCode,
    },
  });
}

export async function updateWigColor(id: string, name: string, hexCode?: string) {
  const currentUser = await getAuthenticatedUserFromDb();
  
  if (!isAdmin(currentUser)) {
    throw new Error('Unauthorized: Admin access required');
  }

  return await prismaClient.wigColor.update({
    where: { id },
    data: {
      name,
      hexCode,
    },
  });
}

export async function deleteWigColor(id: string) {
  const currentUser = await getAuthenticatedUserFromDb();
  
  if (!isAdmin(currentUser)) {
    throw new Error('Unauthorized: Admin access required');
  }

  return await prismaClient.wigColor.delete({
    where: { id },
  });
}

// Wig Size Actions
export async function createWigSize(name: string, description?: string) {
  const currentUser = await getAuthenticatedUserFromDb();
  
  if (!isAdmin(currentUser)) {
    throw new Error('Unauthorized: Admin access required');
  }

  const maxOrderIndex = await prismaClient.wigSize.findFirst({
    orderBy: { orderIndex: 'desc' },
    select: { orderIndex: true },
  });

  return await prismaClient.wigSize.create({
    data: {
      name,
      description,
      orderIndex: (maxOrderIndex?.orderIndex ?? -1) + 1,
    },
  });
}

export async function updateWigSize(id: string, name: string, description?: string) {
  const currentUser = await getAuthenticatedUserFromDb();
  
  if (!isAdmin(currentUser)) {
    throw new Error('Unauthorized: Admin access required');
  }

  return await prismaClient.wigSize.update({
    where: { id },
    data: {
      name,
      description,
    },
  });
}

export async function deleteWigSize(id: string) {
  const currentUser = await getAuthenticatedUserFromDb();
  
  if (!isAdmin(currentUser)) {
    throw new Error('Unauthorized: Admin access required');
  }

  return await prismaClient.wigSize.delete({
    where: { id },
  });
}

// Currency Actions
export async function createCurrency(id: string, name: string, symbol: string, rate: number) {
  const currentUser = await getAuthenticatedUserFromDb();
  
  if (!isAdmin(currentUser)) {
    throw new Error('Unauthorized: Admin access required');
  }

  return await prismaClient.currency.create({
    data: {
      id, // e.g., "USD"
      name,
      symbol,
      rate,
    },
  });
}

export async function updateCurrency(id: string, name: string, symbol: string, rate: number) {
  const currentUser = await getAuthenticatedUserFromDb();
  
  if (!isAdmin(currentUser)) {
    throw new Error('Unauthorized: Admin access required');
  }

  return await prismaClient.currency.update({
    where: { id },
    data: {
      name,
      symbol,
      rate,
    },
  });
}

export async function deleteCurrency(id: string) {
  const currentUser = await getAuthenticatedUserFromDb();
  
  if (!isAdmin(currentUser)) {
    throw new Error('Unauthorized: Admin access required');
  }

  return await prismaClient.currency.delete({
    where: { id },
  });
}
