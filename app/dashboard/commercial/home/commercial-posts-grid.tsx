"use client";

import { useState } from "react";
import { PostWithRelations, Currency } from "@/types";
import { PostDetailsDialog } from "@/app/dashboard/infographe/home/_components/post-details-dialog";
import { Button } from "@/components/ui/button";
import { Check, Eye, Share, ChevronLeft, ChevronRight } from "lucide-react";
import { markPostAsShared, unmarkPostAsShared } from "@/app/actions/post-actions";
import { toast } from "sonner";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { UserBrand } from "@prisma/client";

interface Props {
  posts: PostWithRelations[];
  currencies: Currency[];
  userBrand: UserBrand;
}

export function CommercialPostsGrid({ posts, currencies, userBrand }: Props) {
  const [selectedPost, setSelectedPost] = useState<PostWithRelations | null>(null);
  const [imageIndices, setImageIndices] = useState<Record<string, number>>(() => {
    // Initialize indices for all posts
    const initialIndices: Record<string, number> = {};
    posts.forEach(post => {
      initialIndices[post.id] = 0;
    });
    return initialIndices;
  });

  const getAssociatedUserBrand = (post: PostWithRelations) => {
    const brand = post.brands?.find(b => b.brand.id == userBrand.brandId);
    return brand?.brand?.name || 'No brand';
  };

  const handleShare = async (postId: string, isShared: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    const result = isShared 
      ? await unmarkPostAsShared(postId)
      : await markPostAsShared(postId);
    
    if (result.success) {
      toast.success(isShared ? "Post désactivé comme partagé" : "Post activé comme partagé");
    } else {
      toast.error(result.error || "Erreur lors de la mise à jour du statut de partage du post");
    }
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Aucun post disponible
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
            <div 
              className="relative aspect-square cursor-pointer group"
              onClick={() => {
                setImageIndices(prev => ({ ...prev, [post.id]: 0 }));
                setSelectedPost(post);
              }}
            >
              {post.mediaUrls[0] ? (
                <>
                  <Image
                    src={post.mediaUrls[imageIndices[post.id] || 0] || post.mediaUrls[0]}
                    alt={post.wig?.name || "Post image"}
                    fill
                    className="object-contain transition-transform group-hover:scale-105"
                  />
                  {post.mediaUrls.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageIndices(prev => ({
                            ...prev,
                            [post.id]: prev[post.id] === 0 ? post.mediaUrls.length - 1 : (prev[post.id] || 0) - 1
                          }));
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageIndices(prev => ({
                            ...prev,
                            [post.id]: prev[post.id] === post.mediaUrls.length - 1 ? 0 : (prev[post.id] || 0) + 1
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
                              setImageIndices(prev => ({
                                ...prev,
                                [post.id]: index
                              }));
                            }}
                            className={`h-1.5 rounded-full transition-all ${
                              (imageIndices[post.id] || 0) === index ? "w-4 bg-white" : "w-1.5 bg-white/50"
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
              <div className="absolute top-2 right-2">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                  onClick={(e) => handleShare(post.id, post.sharedBy.length > 0, e)}
                >
                  {post.sharedBy.length > 0 ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Share className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium truncate">{post.wig?.name}</h3>
                  <Badge variant="secondary">
                    {post.wig?.basePrice} {post.wig?.currency?.symbol}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {getAssociatedUserBrand(post)}
                </p>
                {post.wig?.quality?.name && (
                  <Badge variant="outline" className="text-xs">
                    {post.wig.quality.name}
                  </Badge>
                )}
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between text-xs text-muted-foreground">
              <span>
                Créé le {format(new Date(post.createdAt), 'Pp', { locale: fr })}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={() => setSelectedPost(post)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Détails
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedPost && (
        <PostDetailsDialog
          post={selectedPost}
          currencies={currencies}
          open={!!selectedPost}
          showShareButtons={true}
          onOpenChange={(open: boolean) => !open && setSelectedPost(null)}
          userBrand={userBrand}
        />
      )}
    </>
  );
} 