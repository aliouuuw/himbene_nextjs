"use client";

import { PostWithRelations, Currency } from "@/types";
import { PostCard } from "@/components/post-card";

interface ClientPostDisplayProps {
  post: PostWithRelations;
  currencies: Currency[];
}

export function ClientPostDisplay({ post, currencies }: ClientPostDisplayProps) {
  return (
    <PostCard
      post={post}
      currencies={currencies}
      variant="default"
      showActions={false}
      showShareButtons={true}
    />
  );
} 