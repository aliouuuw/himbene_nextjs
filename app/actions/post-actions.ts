"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import prismaClient from "@/lib/prisma-client";
import { PostStatus } from "@prisma/client";

export type CreatePostInput = {
  content: string;
  mediaUrls: string[];
  scheduledFor?: Date;
  brandId: string;
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

export async function getDraftPosts() {
  const { userId } = await auth();
  
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const posts = await prismaClient.post.findMany({
      where: {
        status: PostStatus.DRAFT,
      },
      include: {
        user: true,
        brand: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { success: true, data: posts };
  } catch (error) {
    console.error('Failed to fetch draft posts:', error);
    return { success: false, error: 'Failed to fetch draft posts' };
  }
}