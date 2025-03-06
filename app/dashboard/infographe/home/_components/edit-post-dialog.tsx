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
import { WigQuality } from "@prisma/client";

interface EditPostDialogProps {
  post: PostWithRelations;
  currencies: Currency[];
  qualities: WigQuality[];
}

export function EditPostDialog({ post, currencies, qualities }: EditPostDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    wigName: post.wig?.name || "",
    wigDescription: post.wig?.description || "",
    basePrice: post.wig?.basePrice || 0,
    currencyId: post.wig?.currencyId || currencies[0]?.id || "",
    qualityId: post.wig?.quality?.id || qualities[0]?.id || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate required fields
    if (!formData.qualityId) {
      toast.error("Veuillez sélectionner une qualité");
      setLoading(false);
      return;
    }

    try {
      const result = await updatePost(post.id, {
        content: formData.wigDescription,
        wigData: {
          name: formData.wigName,
          description: formData.wigDescription,
          basePrice: formData.basePrice,
          currencyId: formData.currencyId,
          qualityId: formData.qualityId,
        },
      });

      if (result.success) {
        toast.success("Post mis à jour avec succès");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Échec de la mise à jour du post");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("Une erreur s'est produite lors de la mise à jour du post");
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
          <DialogTitle>Modifier le post</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wigName">Nom de la perruque</Label>
            <Input
              id="wigName"
              value={formData.wigName}
              onChange={(e) => setFormData(prev => ({ ...prev, wigName: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wigDescription">Description / Contenu du post</Label>
            <Textarea
              id="wigDescription"
              value={formData.wigDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, wigDescription: e.target.value }))}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="basePrice">Prix local</Label>
              <Input
                id="basePrice"
                type="number"
                value={formData.basePrice}
                onChange={(e) => setFormData(prev => ({ ...prev, basePrice: Number(e.target.value) }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Devise</Label>
              <select
                id="currency"
                value={formData.currencyId}
                onChange={(e) => setFormData(prev => ({ ...prev, currencyId: e.target.value }))}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                {currencies.map(currency => (
                  <option 
                    key={currency.id} 
                    value={currency.id}
                  >
                    {currency.symbol} ({currency.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quality">Qualité</Label>
              <select
                id="quality"
                value={formData.qualityId}
                onChange={(e) => setFormData(prev => ({ ...prev, qualityId: e.target.value }))}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                required
              >
                <option value="">Sélectionner une qualité</option>
                {qualities?.map(quality => (
                  <option key={quality.id} value={quality.id}>
                    {quality.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 