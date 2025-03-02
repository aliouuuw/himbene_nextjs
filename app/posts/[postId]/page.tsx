import { notFound } from "next/navigation";
import prismaClient from "@/lib/prisma-client";
import { Metadata } from "next";
import { PostWithRelations } from "@/types";
import { getCurrencies } from "@/app/actions/admin-actions";
import { PostCard } from "@/components/post-card";

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
    wig: post.wig ? {
      ...post.wig,
      basePrice: Number(post.wig.basePrice),
      currency: {
        ...post.wig.currency,
        rate: Number(post.wig.currency.rate)
      },
    } : null,
  } as unknown as PostWithRelations;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <PostCard
        post={serializedPost}
        currencies={currencies}
        variant="default"
        showActions={false}
      />
      
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Additional Details</h2>
        {/* Add any additional sections you want to show on the full page */}
      </div>
    </div>
  );
}