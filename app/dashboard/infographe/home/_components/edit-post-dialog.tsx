"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PostWithRelations } from "@/types";
import { updatePost } from "@/app/actions/post-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Currency } from "@/types";

interface EditPostDialogProps {
  post: PostWithRelations;
  currencies: Currency[];
}

export function EditPostDialog({ post, currencies }: EditPostDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    wigName: post.wig?.name || "",
    wigDescription: post.wig?.description || "",
    basePrice: post.wig?.basePrice || 0,
    currencyId: post.wig?.currencyId || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updatePost(post.id, {
        content: formData.wigDescription,
        wigData: {
          name: formData.wigName,
          description: formData.wigDescription,
          basePrice: formData.basePrice,
          currencyId: formData.currencyId,
        },
      });

      if (result.success) {
        toast.success("Post updated successfully");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update post");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("An error occurred while updating the post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Edit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wigName">Wig Name</Label>
            <Input
              id="wigName"
              value={formData.wigName}
              onChange={(e) => setFormData(prev => ({ ...prev, wigName: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wigDescription">Description</Label>
            <Textarea
              id="wigDescription"
              value={formData.wigDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, wigDescription: e.target.value }))}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="basePrice">Base Price</Label>
              <Input
                id="basePrice"
                type="number"
                value={formData.basePrice}
                onChange={(e) => setFormData(prev => ({ ...prev, basePrice: Number(e.target.value) }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <select
                id="currency"
                value={formData.currencyId}
                onChange={(e) => setFormData(prev => ({ ...prev, currencyId: e.target.value }))}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                {currencies.map(currency => (
                  <option key={currency.id} value={currency.id}>
                    {currency.symbol} ({currency.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 