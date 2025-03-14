import { notFound } from "next/navigation";
import prismaClient from "@/lib/prisma-client";
import { Metadata } from "next";
import { PostWithRelations } from "@/types";
import { getCurrencies, getUserBrand } from "@/app/actions/admin-actions";
import { ClientPostDisplay } from "./client-post-display";
import { UserBrand } from "@prisma/client";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

export async function generateMetadata(
  { params }: { params: Promise<{ postId: string }> }
): Promise<Metadata> {
  const postId = (await params).postId;
  const post = await prismaClient.post.findUnique({
    where: { id: postId as string },
    include: {
      brands: {
        include: {
          brand: true,
        },
      },
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

  const title = post.wig?.name + "|" + ` ${post.wig?.basePrice} F` || post.brands[0].brand.name + "|" + ` ${post.wig?.basePrice} F`;
  const description = post.wig?.description || post.brands[0].brand.description || "";
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
      'application-name': post.brands[0].brand.name,
      'author': post.brands[0].brand.name,
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
            name: true,
          }
        },
        brands: {
          include: {
            brand: true,
          },
        },
        wig: {
          include: {
            color: true,
            size: true,
            currency: true,
            quality: true,
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
    user: post.user || { name: null },
    brandIds: [],
    brands: [],
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
      quality: {
        id: post.wig.quality?.id,
        name: post.wig.quality?.name,
        orderIndex: post.wig.quality?.orderIndex,
      },
    } : null,
    sharedBy: [],
  } as PostWithRelations;
  const userBrand = await getUserBrand();

  return (
    <div className="relative max-w-4xl mx-auto p-4 space-y-8 flex flex-col items-center">
      <Link href="/posts" className="absolute top-2 left-0 text-blue-500 hover:text-blue-600 flex items-center gap-2">
        <ArrowLeftIcon className="w-4 h-4" />
        Retour
      </Link>
      <ClientPostDisplay post={serializedPost} currencies={currencies} userBrand={userBrand as UserBrand} />
    </div>
  );
}