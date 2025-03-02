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
import { getCurrencies } from "@/app/actions/admin-actions";

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
  } as PostWithRelations;

  const formatCurrency = (amount: number, currency: { symbol: string, rate: number }) => {
    const convertedAmount = (amount * currency.rate).toFixed(2);
    return `${currency.symbol}${convertedAmount}`;
  };

  const { wig } = serializedPost;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">{serializedPost.brand.name}</h1>
          <p className="text-sm text-muted-foreground">
            Posted {format(new Date(serializedPost.createdAt), "MMMM d, yyyy")}
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {serializedPost.status}
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {serializedPost.mediaUrls && Array.isArray(serializedPost.mediaUrls) && serializedPost.mediaUrls.length > 0 ? (
            <div className="grid gap-4">
              {serializedPost.mediaUrls.map((url, index) => (
                <div key={index} className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
                  <Image
                    src={typeof url === 'string' ? url : '/default-social-image.jpg'}
                    alt={`${wig?.name || 'Product'} image ${index + 1}`}
                    fill
                    className="object-cover transition-transform hover:scale-105"
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
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">{wig.name}</CardTitle>
                {wig.description && (
                  <p className="text-muted-foreground">{wig.description}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Size</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-base">
                        {wig.size.name}
                      </Badge>
                      {wig.size.description && (
                        <span className="text-xs text-muted-foreground">
                          {wig.size.description}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Color</h3>
                    <div className="flex items-center gap-2">
                      {wig.color.hexCode && (
                        <div 
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: wig.color.hexCode }}
                        />
                      )}
                      <Badge variant="secondary" className="text-base">
                        {wig.color.name}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-muted/50 p-4 space-y-3">
                  <div className="flex items-baseline justify-between border-b pb-2">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Base Price</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(wig.basePrice, {
                          symbol: wig.currency.symbol,
                          rate: Number(wig.currency.rate)
                        })}
                      </p>
                    </div>
                    <Badge variant="outline">{wig.currency.name}</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Other Currencies</p>
                    <div className="grid gap-2">
                      {currencies
                        .filter(curr => curr.id !== wig.currencyId)
                        .map(currency => (
                          <div key={currency.id} 
                               className="flex items-center justify-between py-1">
                            <p className="text-lg">
                              {formatCurrency(wig.basePrice, currency)}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {currency.name}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <Button asChild className="flex-1">
                    <Link href={`/contact?product=${wig.name}`}>
                      Contact Seller
                    </Link>
                  </Button>
                  <Button variant="outline" className="flex-1">
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