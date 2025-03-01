import { notFound } from "next/navigation";
import prismaClient from "@/lib/prisma-client";
import { Metadata } from "next";
import { Post } from "@prisma/client";
import Image from "next/image";
import { format } from "date-fns";

type PostWithRelations = Post & {
  brand: {
    name: string;
  };
  wig?: {
    name: string;
    description: string | null;
    basePrice: number;
    color: {
      name: string;
    };
    size: {
      name: string;
    };
    currency: {
      symbol: string;
    };
  } | null;
};

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

  const title = post.wig?.name || post.brand.name;
  const description = post.content;
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
  };
}

export default async function PostPage(
  { params }: { params: Promise<{ postId: string }> }
) {
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
  }) as PostWithRelations | null;

  if (!post) return notFound();

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{post.brand.name}</h1>
        
        {post.wig && (
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h2 className="text-xl font-semibold">{post.wig.name}</h2>
            {post.wig.description && (
              <p className="text-muted-foreground">{post.wig.description}</p>
            )}
            <div className="flex gap-4 text-sm">
              <span>Size: {post.wig.size.name}</span>
              <span>Color: {post.wig.color.name}</span>
            </div>
            <p className="text-lg font-medium">
              {post.wig.basePrice} {post.wig.currency.symbol}
            </p>
          </div>
        )}

        <p className="text-lg">{post.content}</p>

        {post.mediaUrls && Array.isArray(post.mediaUrls) && post.mediaUrls.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {post.mediaUrls.map((url, index) => (
              <div key={index} className="relative aspect-square">
                <Image
                  src={typeof url === 'string' ? url : '/default-social-image.jpg'}
                  alt={`Post image ${index + 1}`}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          Posted on {format(new Date(post.createdAt), "MMMM d, yyyy")}
        </p>
      </div>
    </div>
  );
}