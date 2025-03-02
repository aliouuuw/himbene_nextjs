import { notFound } from "next/navigation";
import prismaClient from "@/lib/prisma-client";
import { Metadata } from "next";
import { PostWithRelations } from "@/types";
import { getCurrencies } from "@/app/actions/admin-actions";
import { ClientPostDisplay } from "./client-post-display";

export async function generateMetadata(
  { params }: { params: Promise<{ postId: string }> }
): Promise<Metadata> {
  const postId = (await params).postId;
  const post = await prismaClient.post.findUnique({
    where: { id: postId as string },
    include: {
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

  if (!post) return {};

  const title = post.wig?.name + "|" + ` ${post.wig?.basePrice} F` || post.brand.name + "|" + ` ${post.wig?.basePrice} F`;
  const description = post.wig?.description || post.brand.description || "";
  const imageUrl = Array.isArray(post.mediaUrls) && post.mediaUrls.length > 0
    ? post.mediaUrls[0]
    : "/default-social-image.jpg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{
        url: typeof imageUrl === 'string' ? imageUrl : '/default-social-image.jpg',
        width: 1200,
        height: 630,
      }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{
        url: typeof imageUrl === 'string' ? imageUrl : '/default-social-image.jpg',
        width: 1200,
        height: 630,
      }],
    },
    other: {
      'application-name': post.brand.name,
      'author': post.brand.name,
      'linkedin:article:published_time': post.createdAt.toISOString(),
    }
  };
}

export default async function PostPage({ params }: { params: Promise<{ postId: string }> }) {
  const postId = (await params).postId;
  const [post, currencies] = await Promise.all([
    prismaClient.post.findUnique({
      where: { id: postId as string },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          }
        },
        brand: true,
        wig: {
          include: {
            color: true,
            size: true,
            currency: true,
          },
        },
      },
    }),
    getCurrencies()
  ]);

  if (!post) return notFound();

  const serializedPost = {
    ...post,
    isShared: false,
    user: post.user || { firstName: null, lastName: null },
    wig: post.wig ? {
      ...post.wig,
      id: post.wig.id,
      name: post.wig.name,
      description: post.wig.description,
      basePrice: Number(post.wig.basePrice),
      currencyId: post.wig.currencyId,
      color: { name: post.wig.color.name },
      size: { name: post.wig.size.name },
      currency: {
        id: post.wig.currency.id,
        symbol: post.wig.currency.symbol,
        rate: Number(post.wig.currency.rate)
      },
    } : null,
    sharedBy: [],
  } as PostWithRelations;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 flex flex-col items-center">
      <ClientPostDisplay post={serializedPost} currencies={currencies} />
    </div>
  );
}