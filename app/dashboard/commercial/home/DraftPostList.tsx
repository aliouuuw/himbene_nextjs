"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import Image from "next/image";
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
} from "next-share";
import { Post as PrismaPost } from "@prisma/client";

type PostWithRelations = PrismaPost & {
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

export function DraftPostsList({ posts }: { posts: PostWithRelations[] }) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No draft posts available
      </div>
    );
  }

  const formatShareContent = (post: PostWithRelations) => {
    let content = post.content;

    if (post.wig) {
      const wigInfo = `
🎀 ${post.wig.name}
${post.wig.description || ""}
Size: ${post.wig.size.name}
Color: ${post.wig.color.name}

`;
      content = wigInfo + content;
    }

    // Add brand hashtag
    content += `\n\n#${post.brand.name.replace(/\s+/g, "")}`;

    return content;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <Card key={post.id}>
          <CardHeader>
            <CardTitle className="flex justify-between items-start">
              <span className="text-sm font-medium">{post.brand.name}</span>
              <span className="text-xs text-muted-foreground">
                {format(new Date(post.createdAt), "MMM d, yyyy")}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {post.wig && (
              <div className="bg-muted p-3 rounded-md space-y-1">
                <p className="font-medium">{post.wig.name}</p>
                {post.wig.description && (
                  <p className="text-sm text-muted-foreground">
                    {post.wig.description}
                  </p>
                )}
                <div className="flex gap-2 text-sm">
                  <span>Size: {post.wig.size.name}</span>
                  <span>•</span>
                  <span>Color: {post.wig.color.name}</span>
                </div>
                {/* <p className="font-medium">
                  {formatCurrency(post.wig.basePrice, post.wig.currency.symbol)}
                </p> */}
              </div>
            )}

            <p className="text-sm">{post.content}</p>

            {post.mediaUrls &&
              Array.isArray(post.mediaUrls) &&
              post.mediaUrls.length > 0 && (
                <div
                  className={`grid ${
                    post.mediaUrls.length > 1 ? "grid-cols-2" : "grid-cols-1"
                  } gap-2 bg-muted/50 rounded-md p-2`}
                >
                  {(post.mediaUrls as string[]).map((url, index) => (
                    <div key={index} className="relative aspect-square">
                      <Image
                        src={url}
                        alt={`Media ${index + 1}`}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  ))}
                </div>
              )}

            {post.scheduledFor && (
              <p className="text-xs text-muted-foreground">
                Scheduled for: {format(new Date(post.scheduledFor), "PPP")}
              </p>
            )}

            <p className="text-xs text-muted-foreground">
              Created by: {post.user.firstName} {post.user.lastName}
            </p>

            <div className="flex gap-2 pt-4">
              <FacebookShareButton
                url={process.env.NEXT_PUBLIC_APP_URL || ""}
                quote={formatShareContent(post)}
                hashtag={`#${post.brand.name.replace(/\s+/g, "")}`}
              >
                <FacebookIcon size={32} round />
              </FacebookShareButton>

              <TwitterShareButton
                url={process.env.NEXT_PUBLIC_APP_URL || ""}
                title={formatShareContent(post)}
                hashtags={[post.brand.name.replace(/\s+/g, "")]}
              >
                <TwitterIcon size={32} round />
              </TwitterShareButton>

              <LinkedinShareButton
                url={process.env.NEXT_PUBLIC_APP_URL || ""}
                title={post.wig?.name || post.brand.name}
                summary={formatShareContent(post)}
              >
                <LinkedinIcon size={32} round />
              </LinkedinShareButton>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
