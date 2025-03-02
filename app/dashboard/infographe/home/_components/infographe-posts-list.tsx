"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { deletePost } from "@/app/actions/post-actions";
import { toast } from "sonner";
import { EditPostDialog } from "./edit-post-dialog";
import { PostDetailsDialog } from "./post-details-dialog";
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

interface Props {
  posts: PostWithRelations[];
  currencies: Currency[];
}

export function InfographePostsList({ posts, currencies }: Props) {
  const [selectedPost, setSelectedPost] = useState<PostWithRelations | null>(null);

  const handleDelete = async (postId: string) => {
    try {
      const result = await deletePost(postId);
      if (result.success) {
        toast.success("Post deleted successfully");
      } else {
        toast.error(result.error || "Failed to delete post");
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
      toast.error("An error occurred while deleting the post");
    }
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No posts available
      </div>
    );
  }

  return (
    <>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Brand</TableHead>
              <TableHead>Wig</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Media</TableHead>
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
                <TableCell>{post.brand.name}</TableCell>
                <TableCell>{post.wig?.name || "N/A"}</TableCell>
                <TableCell>
                  {format(new Date(post.createdAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  {post.mediaUrls && Array.isArray(post.mediaUrls) ? post.mediaUrls.length : 0} files
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <EditPostDialog post={post} currencies={currencies} />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the post.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(post.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
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
        />
      )}
    </>
  );
} 