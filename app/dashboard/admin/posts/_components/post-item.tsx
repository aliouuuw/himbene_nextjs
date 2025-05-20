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
import { isVideoFile } from "@/lib/media-utils";

interface PostItemProps {
  post: PostWithRelations & { mediaNames?: string[] };
  currencies: Currency[];
  userBrand?: UserBrand;
  qualities: WigQuality[];
  brands: Brand[];
}

const PostItem = ({ post, currencies, userBrand }: PostItemProps) => {
  const [selectedPost, setSelectedPost] = useState<PostWithRelations & { mediaNames?: string[] } | null>(
    null
  );
  const [imageIndices, setImageIndices] = useState<Record<string, number>>(
    () => ({
      [post.id]: 0,
    })
  );

  const handleMediaClick = () => {
    const currentPostWithPotentialMediaNames = {
      ...post,
      mediaNames: post.mediaNames || post.mediaUrls?.map(() => '') || [] 
    };
    setImageIndices((prev) => ({ ...prev, [post.id]: 0 }));
    setSelectedPost(currentPostWithPotentialMediaNames);
  };

  return (
    <>
      <div
        className="relative aspect-square cursor-pointer group"
        onClick={handleMediaClick}
      >
        {post.mediaUrls && post.mediaUrls.length > 0 ? (
          (() => {
            const currentIndex = imageIndices[post.id] || 0;
            const currentUrl = post.mediaUrls[currentIndex];
            const currentName = post.mediaNames?.[currentIndex]; 

            if (!currentUrl) {
              return (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  Média non disponible
                </div>
              );
            }

            return (
              <>
                {isVideoFile(currentName) ? (
                  <div className="relative w-full h-full">
                    <video
                      src={currentUrl}
                      className="w-full h-full object-cover rounded-md"
                      controls={false}
                      onClick={(e) => e.stopPropagation()}
                      playsInline
                      muted
                      loop
                      autoPlay
                    >
                      Votre navigateur ne supporte pas la balise vidéo.
                    </video>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                        <svg 
                          className="w-6 h-6 text-white" 
                          fill="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Image
                    src={currentUrl}
                    alt={post.wig?.name || "Post image"}
                    fill
                    className="object-contain transition-transform group-hover:scale-105 rounded-md"
                  />
                )}
                {post.mediaUrls.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageIndices((prev) => ({
                          ...prev,
                          [post.id]:
                            (prev[post.id] === 0 || typeof prev[post.id] === 'undefined')
                              ? post.mediaUrls.length - 1
                              : (prev[post.id] || 0) - 1,
                        }));
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition z-10"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageIndices((prev) => ({
                          ...prev,
                          [post.id]:
                            (prev[post.id] || 0) === post.mediaUrls.length - 1
                              ? 0
                              : (prev[post.id] || 0) + 1,
                        }));
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition z-10"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-0">
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
            );
          })()
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            Pas de média
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
          isAdmin={true}
        />
      )}
    </>
  );
};

export default PostItem;
