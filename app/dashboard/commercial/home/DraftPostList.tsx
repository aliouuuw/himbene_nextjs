"use client";

import { PostCard } from "@/components/post-card";
import { Currency, PostWithRelations } from "@/types";
import { UserBrand } from "@prisma/client";
interface Props {
  posts: PostWithRelations[];
  currencies: Array<{
    id: string;
    symbol: string;
    rate: string | number;
    isBase: boolean;
  }>;
  userBrand: UserBrand;
}

export function DraftPostsList({ posts, currencies, userBrand }: Props) {
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
        <PostCard
          key={post.id}
          post={post}
          currencies={currencies as Currency[]}
          variant="default"
          userBrand={userBrand as UserBrand}
        />
      ))}
    </div>
  );
}
