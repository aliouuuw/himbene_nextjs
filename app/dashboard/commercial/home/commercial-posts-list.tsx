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

interface Props {
  posts: PostWithRelations[];
  currencies: Currency[];
}

export function CommercialPostsList({ posts, currencies }: Props) {
  const [selectedPost, setSelectedPost] = useState<PostWithRelations | null>(null);

  if (posts.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No posts available
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Brand</TableHead>
              <TableHead>Wig</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Media</TableHead>
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