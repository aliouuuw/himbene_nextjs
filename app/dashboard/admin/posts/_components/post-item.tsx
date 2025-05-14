"use client";

import { PostWithRelations, Currency } from "@/types";
import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";
import Image from "next/image";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { UserBrand, Brand, WigQuality } from "@prisma/client";
import { PostDetailsDialog } from "@/components/post-details-dialog";
import { useState } from "react";

interface PostItemProps {
  post: PostWithRelations;
  currencies: Currency[];
  userBrand?: UserBrand;
  qualities: WigQuality[];
  brands: Brand[];
}

const PostItem = ({ post, currencies, userBrand }: PostItemProps) => {
  const [selectedPost, setSelectedPost] = useState<PostWithRelations | null>(
    null
  );
  const [imageIndices, setImageIndices] = useState<Record<string, number>>(
    () => ({
      [post.id]: 0,
    })
  );

  return (
    <>
      <div
        className="relative aspect-square cursor-pointer group"
        onClick={() => {
          setImageIndices((prev) => ({ ...prev, [post.id]: 0 }));
          setSelectedPost(post);
        }}
      >
        {post.mediaUrls?.[0] ? (
          <>
            <Image
              src={
                post.mediaUrls[imageIndices[post.id] || 0] || post.mediaUrls[0]
              }
              alt={post.wig?.name || "Post image"}
              fill
              className="object-contain transition-transform group-hover:scale-105 rounded-md"
            />
            {post.mediaUrls.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageIndices((prev) => ({
                      ...prev,
                      [post.id]:
                        prev[post.id] === 0
                          ? post.mediaUrls.length - 1
                          : (prev[post.id] || 0) - 1,
                    }));
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageIndices((prev) => ({
                      ...prev,
                      [post.id]:
                        prev[post.id] === post.mediaUrls.length - 1
                          ? 0
                          : (prev[post.id] || 0) + 1,
                    }));
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {post.mediaUrls.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageIndices((prev) => ({
                          ...prev,
                          [post.id]: index,
                        }));
                      }}
                      className={`h-1.5 rounded-full transition-all ${
                        (imageIndices[post.id] || 0) === index
                          ? "w-4 bg-white"
                          : "w-1.5 bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            Pas d&apos;image
          </div>
        )}
      </div>
      <CardContent className="py-4 px-0 flex flex-col items-center">
        <h3 className="font-medium truncate w-full text-center py-2">{post.wig?.name}</h3>
        <div className="flex items-center gap-2">
          {post.wig?.basePrice && post.wig?.currency && (
            <Badge variant="secondary">
              {post.wig.basePrice} {post.wig.currency.symbol}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground pt-2">
          Créé le {format(new Date(post.createdAt), "Pp", { locale: fr })}
        </p>
      </CardContent>
      {selectedPost && (
        <PostDetailsDialog
          post={selectedPost}
          currencies={currencies}
          open={!!selectedPost}
          showShareButtons={false}
          onOpenChange={(open) => !open && setSelectedPost(null)}
          userBrand={
            userBrand || {
              userId: post.userId,
              brandId: post.brands[0].brand.id,
              createdAt: post.createdAt,
            }
          }
        />
      )}
    </>
  );
};

export default PostItem;
