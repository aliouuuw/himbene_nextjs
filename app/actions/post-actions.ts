"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import prismaClient from "@/lib/prisma-client";
import { Post, PostStatus, UserRole } from "@prisma/client";
import { getAuthenticatedUserFromDb } from "@/lib/auth";

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

export async function getAdminPosts(): Promise<{ success: boolean; data?: PostWithRelations[]; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const posts = await prismaClient.post.findMany({
      include: {
        user: true,
        brand: true,
        wig: true,
      },
    });

    return { success: true, data: posts as unknown as PostWithRelations[] };
  } catch (error) {
    console.error("Failed to fetch admin posts:", error);
    return { success: false, error: "Failed to fetch admin posts" };
  }
}

export async function getCommercialDraftPosts(): Promise<{ success: boolean; data?: PostWithRelations[]; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Get posts in draft that are associated with the user's brand or the user is an admin
    const posts = await prismaClient.post.findMany({
      where: {
        status: PostStatus.DRAFT,
        OR: [
          {
            brand: {
              users: {
                some: {
                  userId: userId,
                },
              },
            },
          },
          {
            user: {
              role: UserRole.ADMIN
            }
          }
        ],
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
          id: post.wig.currency.id,
          symbol: post.wig.currency.symbol,
          isBase: post.wig.currency.isBase,
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

export async function getInfographePosts(): Promise<{ success: boolean; data?: PostWithRelations[]; error?: string }> {
  try {
    const currentUser = await getAuthenticatedUserFromDb();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    // If admin, allow viewing all infographe posts
    const posts = await prismaClient.post.findMany({
      where: {
        status: PostStatus.DRAFT,
        OR: [
          {
            // Posts created by the current user if they're an infographe
            userId: currentUser.role === UserRole.INFOGRAPHE ? currentUser.id : undefined
          },
          {
            // All infographe posts if user is admin
            user: {
              role: UserRole.ADMIN
            }
          }
        ]
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          }
        },
        brand: {
          select: {
            name: true,
          }
        },
        wig: {
          include: {
            color: {
              select: { name: true }
            },
            size: {
              select: { name: true }
            },
            currency: {
              select: {
                id: true,
                symbol: true,
                rate: true
              }
            },
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const serializedPosts = posts.map(post => ({
      ...post,
      wig: post.wig ? {
        ...post.wig,
        basePrice: Number(post.wig.basePrice),
        currency: {
          id: post.wig.currency.id,
          symbol: post.wig.currency.symbol,
          rate: Number(post.wig.currency.rate)
        }
      } : null
    }));

    return { success: true, data: serializedPosts as unknown as PostWithRelations[] };
  } catch (error) {
    console.error("Failed to fetch infographe posts:", error);
    return { success: false, error: "Failed to fetch infographe posts" };
  }
}

export async function getPublishedPosts(): Promise<{ success: boolean; data?: PostWithRelations[]; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const posts = await prismaClient.post.findMany({
      where: {
        status: PostStatus.PUBLISHED,
      },
    });

    return { success: true, data: posts as unknown as PostWithRelations[] };
  } catch (error) {
    console.error("Failed to fetch published posts:", error);
    return { success: false, error: "Failed to fetch published posts" };
  }
}

export async function getScheduledPosts(): Promise<{ success: boolean; data?: PostWithRelations[]; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const posts = await prismaClient.post.findMany({
      where: {
        status: PostStatus.SCHEDULED,
      },
    });

    return { success: true, data: posts as unknown as PostWithRelations[] };
  } catch (error) {
    console.error("Failed to fetch scheduled posts:", error);
    return { success: false, error: "Failed to fetch scheduled posts" };
  }
}

export async function deletePost(postId: string) {
  try {
    const currentUser = await getAuthenticatedUserFromDb();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const post = await prismaClient.post.findUnique({
      where: { id: postId },
      include: { user: true }
    });

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    // Allow deletion if user is admin or the original creator
    if (currentUser.role !== UserRole.ADMIN && post.userId !== currentUser.id) {
      return { success: false, error: "Not authorized to delete this post" };
    }

    await prismaClient.post.delete({
      where: { id: postId }
    });

    revalidatePath('/dashboard/infographe/home');
    return { success: true };
  } catch (error) {
    console.error("Failed to delete post:", error);
    return { success: false, error: "Failed to delete post" };
  }
}

export async function updatePost(postId: string, data: {
  content?: string;
  mediaUrls?: string[];
  scheduledFor?: Date | null;
  status?: PostStatus;
  wigData?: {
    name?: string;
    description?: string;
    basePrice?: number;
    colorId?: string;
    sizeId?: string;
    currencyId?: string;
    imageUrls?: string[];
  };
}) {
  try {
    const currentUser = await getAuthenticatedUserFromDb();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const post = await prismaClient.post.findUnique({
      where: { id: postId },
      include: { user: true, wig: true }
    });

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    // Allow updates if user is admin or the original creator
    if (currentUser.role !== UserRole.ADMIN && post.userId !== currentUser.id) {
      return { success: false, error: "Not authorized to update this post" };
    }

    // Update wig if wigData is provided
    if (data.wigData && post.wig) {
      await prismaClient.wig.update({
        where: { id: post.wig.id },
        data: data.wigData
      });
    }

    // Update post
    const updatedPost = await prismaClient.post.update({
      where: { id: postId },
      data: {
        content: data.content,
        mediaUrls: data.mediaUrls,
        scheduledFor: data.scheduledFor,
        status: data.status
      },
      include: {
        user: true,
        brand: true,
        wig: {
          include: {
            color: true,
            size: true,
            currency: true
          }
        }
      }
    });

    // Serialize Decimal values before returning
    const serializedPost = {
      ...updatedPost,
      wig: updatedPost.wig ? {
        ...updatedPost.wig,
        basePrice: Number(updatedPost.wig.basePrice),
        currency: {
          ...updatedPost.wig.currency,
          rate: Number(updatedPost.wig.currency.rate)
        }
      } : null
    };

    revalidatePath('/dashboard/infographe/home');
    return { success: true, data: serializedPost };
  } catch (error) {
    console.error("Failed to update post:", error);
    return { success: false, error: "Failed to update post" };
  }
}