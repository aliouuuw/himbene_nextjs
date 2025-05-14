"use client";

import { deletePostType } from "@/app/actions/admin-actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function PostTypeItem({ postType }: { postType: { id: string; name: string } }) {
  const handleDelete = async () => {
    const result = await deletePostType(postType.id);
    if (result.success) {
      toast.success("Type supprimé");
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <span>{postType.name}</span>
      <Button variant="destructive" size="sm" onClick={handleDelete}>
        Supprimer
      </Button>
    </div>
  );
}
