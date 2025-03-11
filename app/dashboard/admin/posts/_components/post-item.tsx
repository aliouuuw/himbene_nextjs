"use client";

import { PostWithRelations, Currency } from "@/types";
import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";
import Image from "next/image";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Share } from "lucide-react";
import { UserBrand } from "@prisma/client";
import { PostDetailsDialog } from "@/app/dashboard/infographe/home/_components/post-details-dialog";
import { useState } from "react";

interface PostItemProps {
  post: PostWithRelations;
  currencies: Currency[];
  userBrand: UserBrand;
}

const PostItem = ({ post, currencies, userBrand }: PostItemProps) => {
  const [selectedPost, setSelectedPost] = useState<PostWithRelations | null>(null);

  return (
    <>
        <div 
          className="relative aspect-square cursor-pointer"
          onClick={() => setSelectedPost(post)}
        >
          {post.mediaUrls?.[0] ? (
            <Image
              src={post.mediaUrls[0]}
              alt={post.wig?.name || "Post image"}
              fill
              className="object-cover transition-transform group-hover:scale-105 rounded-md"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              Pas d&apos;image
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium truncate">{post.wig?.name}</h3>
              <div className="flex items-center gap-2">
                {post.wig?.basePrice && post.wig?.currency && (
                  <Badge variant="secondary">
                    {post.wig.basePrice} {post.wig.currency.symbol}
                  </Badge>
                )}
                <Badge variant="outline" className="flex items-center gap-1">
                  <Share className="h-3 w-3" />
                  {post.sharedBy?.length || 0}
                </Badge>
              </div>
            </div>
            <div className="flex gap-1 flex-wrap">
              {post.brands?.map((brandRelation) => (
                <Badge key={brandRelation.brand.id} variant="outline" className="text-xs">
                  {brandRelation.brand.name}
                </Badge>
              ))}
            </div>
            {post.wig?.quality?.name && (
              <Badge variant="outline" className="text-xs">
                {post.wig.quality.name}
              </Badge>
            )}
            <div className="text-xs text-muted-foreground pt-2">
              Créé le {format(new Date(post.createdAt), 'Pp', { locale: fr })}
            </div>
          </div>
        </CardContent>
      {selectedPost && (
        <PostDetailsDialog
          post={selectedPost}
          currencies={currencies}
          open={!!selectedPost}
          showShareButtons={false}
          onOpenChange={(open) => !open && setSelectedPost(null)}
          userBrand={userBrand}
        />
      )}
    </>
  );
};

export default PostItem; 