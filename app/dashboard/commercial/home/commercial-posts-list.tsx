"use client";

import { useState } from "react";
import { format } from "date-fns";
import { PostDetailsDialog } from "@/app/dashboard/infographe/home/_components/post-details-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PostWithRelations, Currency } from "@/types";
import { Button } from "@/components/ui/button";
import { Check, Eye, Share } from "lucide-react";
import { markPostAsShared, unmarkPostAsShared } from "@/app/actions/post-actions";
import { toast } from "sonner";

interface Props {
  posts: PostWithRelations[];
  currencies: Currency[];
}

export function CommercialPostsList({ posts, currencies }: Props) {
  const [selectedPost, setSelectedPost] = useState<PostWithRelations | null>(null);

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
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Voir</TableHead>
              <TableHead>Marque</TableHead>
              <TableHead>Perruque</TableHead>
              <TableHead>Créé le</TableHead>
              <TableHead>Médias</TableHead>
              <TableHead>Marquer comme partagé</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow
              key={post.id}                
              >
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPost(post)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
                <TableCell>{post.brand.name}</TableCell>
                <TableCell>{post.wig?.name || "N/A"}</TableCell>
                <TableCell>
                  {format(new Date(post.createdAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  {post.mediaUrls && Array.isArray(post.mediaUrls) ? post.mediaUrls.length : 0} files
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleShare(post.id, post.isShared || false, e)}
                  >
                    {post.isShared ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Share className="h-4 w-4" />
                    )}
                  </Button>
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
          showShareButtons={true}
          onOpenChange={(open: boolean) => !open && setSelectedPost(null)}
        />
      )}
    </>
  );
} 