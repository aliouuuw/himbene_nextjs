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
    basePrice: number;
    currencyId: string;
    currency: {
      symbol: string;
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
    const post = await prismaClient.post.create({
      data: {
        content: input.content,
        mediaUrls: input.mediaUrls,
        scheduledFor: input.scheduledFor,
        status: PostStatus.DRAFT,
        userId: userId,
        brandId: input.brandId,
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

    const posts = await prismaClient.post.findMany({
      where: {
        userId,
        status: PostStatus.DRAFT,
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

    return { success: true, data: posts as PostWithRelations[] };
  } catch (error) {
    console.error("Failed to fetch draft posts:", error);
    return { success: false, error: "Failed to fetch draft posts" };
  }
}