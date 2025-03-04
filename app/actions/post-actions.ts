"use server";

import { revalidatePath } from "next/cache";
import prismaClient from "@/lib/prisma-client";
import { Post, PostStatus, UserRole } from "@prisma/client";
import { getAuthenticatedUserFromDb } from "@/lib/auth";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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
    qualityId: string;
    currencyId: string;
    imageUrls: string[];
  };
};

type PostWithRelations = Post & {
  brand: {
    name: string;
  };
  user: {
    name: string;
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
    quality: {
      name: string;
    };
  } | null;
};

export async function createDraftPost(input: CreatePostInput) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Create the wig first
    const wig = await prismaClient.wig.create({
      data: {
        name: input.wigData.name,
        description: input.content,
        basePrice: input.wigData.basePrice,
        colorId: input.wigData.colorId,
        sizeId: input.wigData.sizeId,
        qualityId: input.wigData.qualityId,
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
        userId: session.user.id,
        brandId: input.brandId,
        wigId: wig.id,
      },
    });

    revalidatePath("/dashboard/commercial/home");
    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/infographe/home");

    return { success: true, data: post };
  } catch (error) {
    console.error("Failed to create post:", error);
    return { success: false, error: "Failed to create post" };
  }
}

export async function getAdminPosts(): Promise<{
  success: boolean;
  data?: PostWithRelations[];
  error?: string;
}> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  try {
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const posts = await prismaClient.post.findMany({
      where: {
        status: {
          in: [PostStatus.DRAFT, PostStatus.PENDING],
        },
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        brand: {
          select: {
            name: true,
          },
        },
        wig: {
          include: {
            color: true,
            size: true,
            currency: true,
          },
        },
        sharedBy: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: (posts as unknown) as PostWithRelations[] };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return { success: false, error: "Failed to fetch posts" };
  }
}

export async function getCommercialDraftPosts(): Promise<{
  success: boolean;
  data?: PostWithRelations[];
  error?: string;
}> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  try {
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    // First, get the IDs of posts that the user has shared
    const sharedPostIds = await prismaClient.sharedPost.findMany({
      where: { userId: session.user.id },
      select: { postId: true },
    });

    const sharedIds = new Set(sharedPostIds.map((p) => p.postId));

    const posts = await prismaClient.post.findMany({
      where: {
        status: PostStatus.DRAFT,
        OR: [
          {
            brand: {
              users: {
                some: {
                  userId: session.user.id,
                },
              },
            },
          },
          {
            user: {
              role: UserRole.ADMIN,
            },
          },
        ],
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        brand: {
          select: {
            name: true,
          },
        },
        wig: {
          include: {
            color: {
              select: { name: true },
            },
            size: {
              select: { name: true },
            },
            currency: {
              select: {
                id: true,
                symbol: true,
                rate: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const serializedPosts = posts.map((post) => ({
      ...post,
      isShared: sharedIds.has(post.id),
      wig: post.wig
        ? {
            ...post.wig,
            basePrice: post.wig.basePrice.toString(),
            currency: {
              id: post.wig.currency.id,
              symbol: post.wig.currency.symbol,
              rate: post.wig.currency.rate.toString(),
            },
          }
        : null,
    }));

    return {
      success: true,
      data: (serializedPosts as unknown) as PostWithRelations[],
    };
  } catch (error) {
    console.error("Failed to fetch draft posts:", error);
    return { success: false, error: "Failed to fetch draft posts" };
  }
}

export async function getInfographePosts(): Promise<{
  success: boolean;
  data?: PostWithRelations[];
  error?: string;
}> {
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
            userId:
              currentUser.role === UserRole.INFOGRAPHE
                ? currentUser.id
                : undefined,
          },
          {
            // All infographe posts if user is admin
            user: {
              role: UserRole.ADMIN,
            },
          },
        ],
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        brand: {
          select: {
            name: true,
          },
        },
        wig: {
          include: {
            color: {
              select: { name: true },
            },
            size: {
              select: { name: true },
            },
            quality: {
              select: { name: true },
            },
            currency: {
              select: {
                id: true,
                symbol: true,
                rate: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const serializedPosts = posts.map((post) => ({
      ...post,
      wig: post.wig
        ? {
            ...post.wig,
            basePrice: Number(post.wig.basePrice),
            currency: {
              id: post.wig.currency.id,
              symbol: post.wig.currency.symbol,
              rate: Number(post.wig.currency.rate),
            },
          }
        : null,
    }));

    return {
      success: true,
      data: (serializedPosts as unknown) as PostWithRelations[],
    };
  } catch (error) {
    console.error("Failed to fetch infographe posts:", error);
    return { success: false, error: "Failed to fetch infographe posts" };
  }
}

export async function getPublishedPosts(): Promise<{
  success: boolean;
  data?: PostWithRelations[];
  error?: string;
}> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  try {
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const posts = await prismaClient.post.findMany({
      where: {
        status: PostStatus.PUBLISHED,
      },
    });

    return { success: true, data: (posts as unknown) as PostWithRelations[] };
  } catch (error) {
    console.error("Failed to fetch published posts:", error);
    return { success: false, error: "Failed to fetch published posts" };
  }
}

export async function getScheduledPosts(): Promise<{
  success: boolean;
  data?: PostWithRelations[];
  error?: string;
}> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  try {
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const posts = await prismaClient.post.findMany({
      where: {
        status: PostStatus.SCHEDULED,
      },
    });

    return { success: true, data: (posts as unknown) as PostWithRelations[] };
  } catch (error) {
    console.error("Failed to fetch scheduled posts:", error);
    return { success: false, error: "Failed to fetch scheduled posts" };
  }
}

export async function deletePost(postId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  try {
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const currentUser = await getAuthenticatedUserFromDb();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const post = await prismaClient.post.findUnique({
      where: { id: postId },
      include: { user: true },
    });

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    // Allow deletion if user is admin or the original creator
    if (currentUser.role !== UserRole.ADMIN && post.userId !== currentUser.id) {
      return { success: false, error: "Not authorized to delete this post" };
    }

    await prismaClient.post.delete({
      where: { id: postId },
    });

    revalidatePath("/dashboard/infographe/home");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete post:", error);
    return { success: false, error: "Failed to delete post" };
  }
}

export async function updatePost(
  postId: string,
  data: {
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
      qualityId?: string;
      currencyId?: string;
      imageUrls?: string[];
    };
  }
) {
  try {
    const currentUser = await getAuthenticatedUserFromDb();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const post = await prismaClient.post.findUnique({
      where: { id: postId },
      include: { user: true, wig: true },
    });

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    // Allow updates if user is admin or the original creator
    if (currentUser.role !== UserRole.ADMIN && post.userId !== currentUser.id) {
      return { success: false, error: "Not authorized to update this post" };
    }

    // If content is being updated, make sure it syncs to the wig description
    if (data.content && data.wigData) {
      data.wigData.description = data.content;
    } else if (data.content && post.wig) {
      // If no wigData provided but content updated, update wig description separately
      await prismaClient.wig.update({
        where: { id: post.wig.id },
        data: {
          description: data.content,
        },
      });
    }

    // If wigData has description without content update, sync that to post content
    if (data.wigData?.description && !data.content) {
      data.content = data.wigData.description;
    }

    // Update wig if wigData is provided
    if (data.wigData && post.wig) {
      await prismaClient.wig.update({
        where: { id: post.wig.id },
        data: data.wigData,
      });
    }

    // Update post
    const updatedPost = await prismaClient.post.update({
      where: { id: postId },
      data: {
        content: data.content,
        mediaUrls: data.mediaUrls,
        scheduledFor: data.scheduledFor,
        status: data.status,
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
    });

    // Serialize Decimal values before returning
    const serializedPost = {
      ...updatedPost,
      wig: updatedPost.wig
        ? {
            ...updatedPost.wig,
            basePrice: Number(updatedPost.wig.basePrice),
            currency: {
              ...updatedPost.wig.currency,
              rate: Number(updatedPost.wig.currency.rate),
            },
          }
        : null,
    };

    revalidatePath("/dashboard/infographe/home");
    revalidatePath("/dashboard/commercial/home");
    return { success: true, data: serializedPost };
  } catch (error) {
    console.error("Failed to update post:", error);
    return { success: false, error: "Failed to update post" };
  }
}

export async function markPostAsShared(postId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  try {
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const sharedPost = await prismaClient.sharedPost.create({
      data: {
        postId,
        userId: session.user.id,
      },
    });

    revalidatePath("/dashboard/commercial/home");
    return { success: true, data: sharedPost };
  } catch (error) {
    console.error("Failed to mark post as shared:", error);
    return { success: false, error: "Failed to mark post as shared" };
  }
}

export async function unmarkPostAsShared(postId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  try {
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    await prismaClient.sharedPost.delete({
      where: {
        postId_userId: {
          postId,
          userId: session.user.id,
        },
      },
    });

    revalidatePath("/dashboard/commercial/home");
    return { success: true };
  } catch (error) {
    console.error("Failed to unmark post as shared:", error);
    return { success: false, error: "Failed to unmark post as shared" };
  }
}
