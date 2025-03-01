"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import Image from "next/image";
import { Post, User, Brand } from "@prisma/client";

type PostWithRelations = Post & {
  user: User;
  brand: Brand;
};

export function DraftPostsList({ posts }: { posts: PostWithRelations[] }) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No draft posts available
      </div>
    );
  }

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
            <p className="text-sm">{post.content}</p>
            
            {post.mediaUrls && Array.isArray(post.mediaUrls) && post.mediaUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}