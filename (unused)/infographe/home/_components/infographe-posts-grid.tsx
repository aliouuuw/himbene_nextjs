"use client";

import { useState } from "react";
import { PostWithRelations, Currency } from "@/types";
import { Button } from "@/components/ui/button";
import { Share, Trash, ChevronLeft, ChevronRight } from "lucide-react";
import { deletePost } from "@/app/actions/post-actions";
import { toast } from "sonner";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { WigQuality, Brand, UserBrand } from "@prisma/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PostDetailsDialog } from "../../../../components/post-details-dialog";

interface Props {
  posts: PostWithRelations[];
  currencies: Currency[];
  qualities: WigQuality[];
  brands: Brand[];
  userBrand: UserBrand;
}

export function InfographePostsGrid({ posts, currencies, userBrand }: Props) {
  const [selectedPost, setSelectedPost] = useState<PostWithRelations | null>(null);
  const [imageIndices, setImageIndices] = useState<Record<string, number>>(() => {
    // Initialize indices for all posts
    const initialIndices: Record<string, number> = {};
    posts.forEach(post => {
      initialIndices[post.id] = 0;
    });
    return initialIndices;
  });

  const handleDelete = async (postId: string) => {
    try {
      const result = await deletePost(postId);
      if (result.success) {
        toast.success("Post supprimé avec succès");
      } else {
        toast.error(result.error || "Erreur lors de la suppression du post");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du post:", error);
      toast.error("Une erreur est survenue lors de la suppression du post");
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
            </div>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium truncate">{post.wig?.name}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {post.wig?.basePrice} {post.wig?.currency?.symbol}
                    </Badge>
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
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between text-xs text-muted-foreground">
              <span>
                Créé le {format(new Date(post.createdAt), 'Pp', { locale: fr })}
              </span>
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-0 h-8 w-8 text-destructive">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce post ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irréversible. Cela supprimera définitivement le post.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(post.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedPost && (
        <PostDetailsDialog
          post={selectedPost}
          currencies={currencies}
          open={!!selectedPost}
          showShareButtons={false}
          onOpenChange={(open: boolean) => !open && setSelectedPost(null)}
          userBrand={userBrand}
        />
      )}
    </>
  );
}