import { notFound } from "next/navigation";
import prismaClient from "@/lib/prisma-client";
import { Metadata } from "next";
import Image from "next/image";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PostWithRelations } from "@/types";

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
    other: {
      'application-name': post.brand.name,
      'author': post.brand.name,
      'linkedin:article:published_time': post.createdAt.toISOString(),
    }
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
  });

  if (!post) return notFound();

  const serializedPost = {
    ...post,
    wig: post.wig ? {
      ...post.wig,
      basePrice: post.wig.basePrice.toString(),
      currency: {
        ...post.wig.currency,
        rate: post.wig.currency.rate.toString(),
      },
    } : null,
  } as PostWithRelations;

  const { wig } = serializedPost;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{serializedPost.brand.name}</h1>
        <Badge variant="outline">
          Posted {format(new Date(serializedPost.createdAt), "MMMM d, yyyy")}
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {serializedPost.mediaUrls && Array.isArray(serializedPost.mediaUrls) && serializedPost.mediaUrls.length > 0 ? (
            <div className="grid gap-4">
              {serializedPost.mediaUrls.map((url, index) => (
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
          ) : (
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">No images available</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {wig ? (
            <Card>
              <CardHeader>
                <CardTitle>{wig.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {wig.description && (
                  <p className="text-muted-foreground">{wig.description}</p>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Size</p>
                    <Badge variant="secondary" className="text-base">
                      {wig.size.name}
                    </Badge>
                    {wig.size.description && (
                      <p className="text-xs text-muted-foreground">
                        {wig.size.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Color</p>
                    <div className="flex items-center gap-2">
                      {wig.color.hexCode && (
                        <div 
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: wig.color.hexCode }}
                        />
                      )}
                      <Badge variant="secondary" className="text-base">
                        {wig.color.name}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-baseline justify-between">
                    <p className="text-2xl font-bold">
                      {wig.basePrice} {wig.currency.symbol}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {wig.currency.name}
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <Button asChild className="flex-1">
                    <Link href={`/contact?product=${wig.name}`}>
                      Contact Seller
                    </Link>
                  </Button>
                  <Button variant="secondary" className="flex-1">
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">
                  No product details available
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed whitespace-pre-wrap">
                {serializedPost.content}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}