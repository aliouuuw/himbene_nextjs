'use server'

import prismaClient from "@/lib/prisma-client";
import { getAuthenticatedUserFromDb, isAdmin } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { fetchExchangeRates } from "@/lib/exchange-rates";

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

interface CurrencyData {
  id?: string;
  name: string;
  symbol: string;
  isBase: boolean;
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

  const currencies = await prismaClient.currency.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  // Convert Decimal to number for serialization
  return currencies.map(currency => ({
    ...currency,
    rate: Number(currency.rate)
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
export async function createCurrency(data: CurrencyData) {
  try {
    // Check if we're trying to set this as base while another base exists
    if (data.isBase) {
      const existingBase = await prismaClient.currency.findFirst({
        where: { isBase: true }
      });
      
      if (existingBase) {
        return { 
          success: false, 
          error: `Cannot set as base currency. ${existingBase.name} (${existingBase.id}) is already the base currency. Either update the ${existingBase.name} or delete ${existingBase.name} before setting a new base currency.` 
        };
      }
    }

    const result = await prismaClient.currency.create({
      data: {
        id: data.id!,
        name: data.name,
        symbol: data.symbol,
        isBase: data.isBase,
        rate: data.isBase ? 1 : 0,
      }
    });

    const sanitizedResult = {
      ...result,
      rate: Number(result.rate)
    };

    // Sync rates after adding new currency
    await syncExchangeRates();
    
    revalidatePath("/dashboard/admin/currencies");
    return { success: true, data: sanitizedResult };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create currency" };
  }
}

export async function updateCurrency(id: string, data: CurrencyData) {
  try {
    // Check if we're trying to set this as base while another base exists
    if (data.isBase) {
      const existingBase = await prismaClient.currency.findFirst({
        where: { 
          isBase: true,
          id: { not: id } // Exclude current currency from check
        }
      });

      // Set isBase to false for the existing base currency
      if (existingBase) {
        await prismaClient.currency.update({
          where: { id: existingBase.id },
          data: { isBase: false }
        });
      }
    }

    const result = await prismaClient.currency.update({
      where: { id },
      data: {
        name: data.name,
        symbol: data.symbol,
        isBase: data.isBase,
        rate: data.isBase ? 1 : undefined,
      }
    });

    const sanitizedResult = {
      ...result,
      rate: Number(result.rate)
    };

    // Sync rates after updating currency
    await syncExchangeRates();

    revalidatePath("/dashboard/admin/currencies");
    return { success: true, data: sanitizedResult };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update currency" };
  }
}

export async function deleteCurrency(id: string) {
  try {
    const currency = await prismaClient.currency.findUnique({
      where: { id }
    });

    if (currency?.isBase) {
      return { success: false, error: "Cannot delete base currency. Please set another currency as base first." };
    }

    // Find base currency to reassign wigs
    const baseCurrency = await prismaClient.currency.findFirst({
      where: { isBase: true }
    });

    if (!baseCurrency) {
      return { success: false, error: "No base currency found to reassign wigs" };
    }

    // Update all wigs using this currency to use base currency
    await prismaClient.wig.updateMany({
      where: { currencyId: id },
      data: { currencyId: baseCurrency.id }
    });

    // Now safe to delete the currency
    await prismaClient.currency.delete({
      where: { id }
    });
    
    // Sync rates after deleting currency
    await syncExchangeRates();
    
    revalidatePath("/dashboard/admin/currencies");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete currency:", error);
    return { success: false, error: "Failed to delete currency" };
  }
}

export async function syncExchangeRates() {
  try {
    const baseCurrency = await prismaClient.currency.findFirst({
      where: { isBase: true }
    });

    if (!baseCurrency) {
      return { success: false, error: "No base currency set" };
    }

    const result = await fetchExchangeRates(baseCurrency.id);
    
    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Update all currency rates
    await Promise.all(
      Object.entries(result.rates).map(([code, rate]) =>
        prismaClient.currency.updateMany({
          where: { id: code },
          data: { 
            rate: Number(rate), // Ensure rate is converted to number
            lastUpdated: new Date()
          }
        })
      )
    );

    // Fetch updated currencies and convert Decimal to number
    const updatedCurrencies = await prismaClient.currency.findMany();
    const sanitizedCurrencies = updatedCurrencies.map(currency => ({
      ...currency,
      rate: Number(currency.rate)
    }));

    revalidatePath("/dashboard/admin/currencies");
    return { success: true, data: sanitizedCurrencies };
  } catch (error) {
    console.error("Failed to sync exchange rates:", error);
    return { success: false, error: "Failed to sync exchange rates" };
  }
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

// Wig Quality Actions
export async function getWigQualities() {
  const currentUser = await getAuthenticatedUserFromDb();
  
  if (!isAdmin(currentUser)) {
    throw new Error('Unauthorized: Admin access required');
  }

  return await prismaClient.wigQuality.findMany({
    orderBy: {
      orderIndex: 'asc',
    },
  });
}

export async function createWigQuality(name: string, description: string) {
  try {
    const result = await prismaClient.wigQuality.create({
      data: { name, description }
    });
    revalidatePath("/dashboard/admin/qualities");
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create quality" };
  }
}

export async function updateWigQuality(id: string, name: string, description: string) {
  try {
    const result = await prismaClient.wigQuality.update({
      where: { id },
      data: { name, description }
    });
    revalidatePath("/dashboard/admin/qualities");
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to update quality" };
  }
}

export async function deleteWigQuality(id: string) {
  try {
    await prismaClient.wigQuality.delete({
      where: { id }
    });
    revalidatePath("/dashboard/admin/qualities");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to delete quality" };
  }
}
