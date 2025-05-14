/* eslint-disable @typescript-eslint/no-explicit-any*/
'use server'

import prismaClient from "@/lib/prisma-client";
import { isAdmin, auth, getAuthenticatedUserFromDb } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { fetchExchangeRates } from "@/lib/exchange-rates";
import { sendTemporaryPasswordEmail } from "./email-actions";

interface CreateUserData {
  email: string;
  role: string;
  name: string;
  brandIds: string[];
}

interface CurrencyData {
  id?: string;
  name: string;
  symbol: string;
  isBase: boolean;
}

export async function createUser(data: CreateUserData) {
  if (!await isAdmin()) {
    throw new Error('Unauthorized: Admin access required');
  }

  try {
    // Generate a random password
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).toUpperCase().slice(-4);
    console.log("Create User with data:", {name: data.name, email: data.email, password: tempPassword, role: data.role});
    // Create the user using auth.api.signUpEmail
    const result = await auth.api.signUpEmail({
      body: {
        name: data.name,
        email: data.email,
        password: tempPassword,
        role: data.role
      }
    });
    
    if (!result.token) {
      throw new Error('Failed to create user');
    }
    
    // Now create the brand associations
    if (data.brandIds.length > 0) {
      await prismaClient.userBrand.createMany({
        data: data.brandIds.map(brandId => ({
          userId: result.user.id,
          brandId
        }))
      });
    }

    // Update the user with password change required
    const account = await prismaClient.account.findFirst({
      where: { userId: result.user.id }
    });
    
    if (account) {
      await prismaClient.account.update({
        where: { id: account.id },
        data: { passwordChangeRequired: true }
      });
    }

    // Get the complete user with brands
    const user = await prismaClient.user.findUnique({
      where: { id: result.user.id }
    });

    // Send email to user with temporary password
    await sendTemporaryPasswordEmail(user?.email as string, tempPassword);

    revalidatePath('/dashboard/admin/users');
    return { 
      success: true, 
      data: user,
      tempPassword // Return the temporary password so it can be displayed to the admin
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: 'Failed to create user' };
  }
}

export async function getUsers() {
  
  if (!await isAdmin()) {
    throw new Error('Unauthorized: Admin access required');
  }

  return prismaClient.user.findMany({
    where: {
      isActive: true,  // Only show active users
      deletedAt: null  // And those that haven't been deleted
    },
    include: {
      brands: {
        include: {
          brand: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

export async function createBrand(data: {
  name: string;
  description: string;
  logoUrl: string;
  isActive: boolean;
}) {
  try {
    const brand = await prismaClient.brand.create({
      data: {
        name: data.name,
        description: data.description || null,
        logoUrl: data.logoUrl || null, // Make sure this accepts the URL
        isActive: data.isActive,
      },
    });
    return { success: true, brand };
  } catch (error: any) {
    console.error("Error creating brand:", error);
    return { success: false, error: error.message };
  }
}

export async function getBrands() {

  return await prismaClient.brand.findMany();
}

export async function getUserBrand() {
  const user = await getAuthenticatedUserFromDb();
  return await prismaClient.userBrand.findFirst({
    where: { userId: user?.id },
    include: {
      brand: true
    }
  });
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

export async function updateBrand(
  id: string,
  data: {
    name: string;
    description: string;
    logoUrl: string;
    isActive: boolean;
  }
) {
  try {
    const brand = await prismaClient.brand.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || null,
        logoUrl: data.logoUrl || null, // Make sure this accepts the URL
        isActive: data.isActive,
      },
    });
    return { success: true, brand };
  } catch (error: any) {
    console.error("Error updating brand:", error);
    return { success: false, error: error.message };
  }
}

export async function getWigColors() {

  return await prismaClient.wigColor.findMany({
    orderBy: {
      name: 'asc',
    },
  });
}

export async function getWigSizes() {

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
  
  if (!await isAdmin()) {
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
          error: `Cannot set as base currency. ${existingBase.name} (${existingBase.id}) is already the base currency.` 
        };
      }
    }

    // Create the currency first
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

    // Trigger exchange rate sync in the background
    // This way, if it times out, at least the currency is created
    void syncExchangeRates().catch(error => {
      console.error("Background exchange rate sync failed:", error);
    });
    
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
  name?: string;
  brandIds?: string[];
  isActive?: boolean;
}) {
  
  if (!await isAdmin()) {
    throw new Error('Unauthorized: Admin access required');
  }

  const user = await prismaClient.user.update({
    where: { id: userId },
    data: {
      role: data.role,
      name: data.name,
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
  
  if (!await isAdmin()) {
    throw new Error('Unauthorized: Admin access required');
  }

  await prismaClient.user.update({
    where: { id: userId },
    data: {
      isActive: false,
      deletedAt: new Date()
    }
  });

  revalidatePath('/dashboard/admin/users');
  return { success: true };
}

// Wig Quality Actions
export async function getWigQualities() {
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

// Post Type Actions
export async function createPostType(name: string) {
  try {
    await prismaClient.postType.create({
      data: { name }
    });
    revalidatePath("/dashboard/admin/posttypes");
    return { success: true };
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to create post type" };
  }
}

export async function getPostTypes() {
  return await prismaClient.postType.findMany({
    orderBy: { createdAt: "desc" }
  });
}

export async function deletePostType(id: string) {
  try {
    await prismaClient.postType.delete({ where: { id } });
    revalidatePath("/dashboard/admin/posttypes");
    return { success: true };
  } catch (error) {
    console.error(error)
    return { success: false, error: "Failed to delete post type" };
  }
}
