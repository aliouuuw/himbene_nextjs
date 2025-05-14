"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { deletePost } from "@/app/actions/post-actions";
import { toast } from "sonner";
import { PostDetailsDialog } from "../../../../../components/post-details-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { PostWithRelations, Currency } from "@/types";
import { fr } from "date-fns/locale";
import { WigQuality, Brand, UserBrand } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Share } from "lucide-react";

interface Props {
  posts: PostWithRelations[];
  currencies: Currency[];
  qualities: WigQuality[];
  brands: Brand[];
  userBrand: UserBrand;
}

export function PostsList({ posts, currencies, userBrand }: Props) {
  const [selectedPost, setSelectedPost] = useState<PostWithRelations | null>(null);

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
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Marques</TableHead>
              <TableHead>Perruque</TableHead>
              <TableHead>Créé le</TableHead>
              <TableHead>Médias</TableHead>
              <TableHead>Partages</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow
                key={post.id}
                className="cursor-pointer"
                onClick={() => setSelectedPost(post)}
              >
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {post.brands?.map((brandRelation) => (
                      <Badge key={brandRelation.brand.id} variant="secondary" className="text-xs">
                        {brandRelation.brand.name}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{post.wig?.name || "N/A"}</TableCell>
                <TableCell>
                  {format(new Date(post.createdAt), "d MMMM yyyy", { locale: fr })}
                </TableCell>
                <TableCell>
                  {post.mediaUrls && Array.isArray(post.mediaUrls) ? post.mediaUrls.length : 0} fichier(s)
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Share className="h-3 w-3" />
                    <span>{post.sharedBy?.length || 0}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">Supprimer</Button>
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedPost && (
        <PostDetailsDialog
          post={selectedPost}
          currencies={currencies}
          open={!!selectedPost}
          showShareButtons={false}
          onOpenChange={(open: boolean) => !open && setSelectedPost(null)}
          userBrand={userBrand as UserBrand}
          isAdmin={true}
        />
      )}
    </>
  );
} 