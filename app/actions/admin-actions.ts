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
  brandIds: string[];
}

interface BrandData {
  name: string;
  description: string;
  logoUrl: string;
  isActive: boolean;
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
          pendingDbCreation: true,
          brandIds: data.brandIds
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send invitation');
    }

    // Store the pending invitation with brand associations
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
    include: {
      brands: {
        include: {
          brand: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createBrand(data: BrandData) {
  try {
    const result = await prismaClient.brand.create({
      data
    });
    revalidatePath("/dashboard/admin/brands");
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create brand" };
  }
}

export async function getBrands() {
  const currentUser = await getAuthenticatedUserFromDb();
  
  if (!isAdmin(currentUser)) {
    throw new Error('Unauthorized: Admin access required');
  }

  return await prismaClient.brand.findMany();
}

export async function deleteBrand(id: string) {
  try {
    await prismaClient.brand.delete({
      where: { id }
    });
    revalidatePath("/dashboard/admin/brands");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete brand" };
  }
}

export async function updateBrand(id: string, data: BrandData) {
  try {
    const result = await prismaClient.brand.update({
      where: { id },
      data
    });
    revalidatePath("/dashboard/admin/brands");
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update brand" };
  }
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
export async function createWigColor(name: string, hexCode: string) {
  try {
    const result = await prismaClient.wigColor.create({
      data: { name, hexCode }
    });
    revalidatePath("/dashboard/admin/colors");
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create color" };
  }
}

export async function updateWigColor(id: string, name: string, hexCode: string) {
  try {
    const result = await prismaClient.wigColor.update({
      where: { id },
      data: { name, hexCode }
    });
    revalidatePath("/dashboard/admin/colors");
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update color" };
  }
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
export async function createWigSize(name: string, description: string) {
  try {
    const result = await prismaClient.wigSize.create({
      data: { name, description }
    });
    revalidatePath("/dashboard/admin/sizes");
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create size" };
  }
}

export async function updateWigSize(id: string, name: string, description: string) {
  try {
    const result = await prismaClient.wigSize.update({
      where: { id },
      data: { name, description }
    });
    revalidatePath("/dashboard/admin/sizes");
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update size" };
  }
}

export async function deleteWigSize(id: string) {
  try {
    await prismaClient.wigSize.delete({
      where: { id }
    });
    revalidatePath("/dashboard/admin/sizes");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete size" };
  }
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

export async function updateUser(userId: string, data: {
  role?: UserRole;
  firstName?: string;
  lastName?: string;
  brandIds?: string[];
  isActive?: boolean;
}) {
  const currentUser = await getAuthenticatedUserFromDb();
  
  if (!isAdmin(currentUser)) {
    throw new Error('Unauthorized: Admin access required');
  }

  const user = await prismaClient.user.update({
    where: { id: userId },
    data: {
      role: data.role,
      firstName: data.firstName,
      lastName: data.lastName,
      isActive: data.isActive,
      brands: {
        deleteMany: {},
        create: data.brandIds?.map(brandId => ({
          brandId
        }))
      }
    },
    include: {
      brands: {
        include: {
          brand: true
        }
      }
    }
  });

  revalidatePath('/admin/users');
  return user;
}

export async function deleteUser(userId: string) {
  const currentUser = await getAuthenticatedUserFromDb();
  
  if (!isAdmin(currentUser)) {
    throw new Error('Unauthorized: Admin access required');
  }

  await prismaClient.user.update({
    where: { id: userId },
    data: {
      isActive: false,
      deletedAt: new Date()
    }
  });

  revalidatePath('/admin/users');
  return { success: true };
}
