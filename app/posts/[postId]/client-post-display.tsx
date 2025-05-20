"use client";

import { PostWithRelations, Currency } from "@/types";
import { PostCard } from "@/components/post-card";
import { UserBrand } from "@prisma/client";
interface ClientPostDisplayProps {
  post: PostWithRelations;
  currencies: Currency[];
  userBrand: UserBrand;
}

export function ClientPostDisplay({ post, currencies, userBrand }: ClientPostDisplayProps) {
  return (
    <PostCard
      post={post}
      currencies={currencies}
      variant="default"
      showActions={false}
      showShareButtons={false}
      userBrand={userBrand}
    />
  );
} 