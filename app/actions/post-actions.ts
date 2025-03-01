"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import prismaClient from "@/lib/prisma-client";
import { Post, PostStatus } from "@prisma/client";

export type CreatePostInput = {
  content: string;
  mediaUrls: string[];
  scheduledFor?: Date;
  brandId: string;
  wigData: {
    name: string;
    description: string;
    basePrice: number;
    colorId: string;
    sizeId: string;
    currencyId: string;
    imageUrls: string[];
  };
};

type PostWithRelations = Post & {
  brand: {
    name: string;
  };
  user: {
    firstName: string | null;
    lastName: string | null;
  };
  wig?: {
    id: string;
    name: string;
    description: string | null;
    basePrice: string;
    currencyId: string;
    currency: {
      symbol: string;
      rate: string;
    };
    color: {
      name: string;
    };
    size: {
      name: string;
    };
  } | null;
};

export async function createDraftPost(input: CreatePostInput) {
  const { userId } = await auth();
  
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Create the wig first
    const wig = await prismaClient.wig.create({
      data: {
        name: input.wigData.name,
        description: input.wigData.description,
        basePrice: input.wigData.basePrice,
        colorId: input.wigData.colorId,
        sizeId: input.wigData.sizeId,
        currencyId: input.wigData.currencyId,
        brandId: input.brandId,
        imageUrls: input.wigData.imageUrls,
        status: "ACTIVE",
      },
    });

    // Then create the post with the new wig
    const post = await prismaClient.post.create({
      data: {
        content: input.content,
        mediaUrls: input.mediaUrls,
        scheduledFor: input.scheduledFor,
        status: PostStatus.DRAFT,
        userId: userId,
        brandId: input.brandId,
        wigId: wig.id,
      },
    });

    revalidatePath('/dashboard/commercial/home');
    revalidatePath('/dashboard/admin');
    
    return { success: true, data: post };
  } catch (error) {
    console.error('Failed to create post:', error);
    return { success: false, error: 'Failed to create post' };
  }
}

export async function getDraftPosts(): Promise<{ success: boolean; data?: PostWithRelations[]; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Get posts in draft that are associated with the user's brand
    const posts = await prismaClient.post.findMany({
      where: {
        status: PostStatus.DRAFT,
        brand: {
          users: {
            some: {
              userId: userId,
            },
          },
        },
      },
      include: {
        user: true,
        brand: true,
        wig: {
          include: {
            color: true,
            size: true,
            currency: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Convert Decimal values to strings in wigs and currencies
    const serializedPosts = posts.map(post => ({
      ...post,
      wig: post.wig ? {
        ...post.wig,
        basePrice: post.wig.basePrice.toString(),
        currency: {
          ...post.wig.currency,
          rate: post.wig.currency.rate.toString(),
        },
      } : null,
    }));

    return { success: true, data: serializedPosts as unknown as PostWithRelations[] };
  } catch (error) {
    console.error("Failed to fetch draft posts:", error);
    return { success: false, error: "Failed to fetch draft posts" };
  }
}