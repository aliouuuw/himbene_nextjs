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
import { createWigQuality, updateWigQuality } from "@/app/actions/admin-actions";
import { toast } from "sonner";

interface QualityDialogProps {
  mode: "add" | "edit";
  quality?: {
    id: string;
    name: string;
    description: string | null;
  };
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function QualityDialog({ mode, quality, onSuccess, trigger }: QualityDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(quality?.name || "");
  const [description, setDescription] = useState(quality?.description || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = mode === "add"
        ? await createWigQuality(name, description)
        : await updateWigQuality(quality!.id, name, description);

      if (result.success) {
        toast.success(`Qualité ${mode === "add" ? "créée" : "modifiée"} avec succès`);
        setOpen(false);
        onSuccess?.();
      } else {
        toast.error(result.error || `Échec de la ${mode === "add" ? "création" : "modification"} de la qualité`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Une erreur s'est produite lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant={mode === "edit" ? "ghost" : "default"}>
          {mode === "add" ? "Ajouter une qualité" : "Modifier"}
        </Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Ajouter une qualité" : "Modifier la qualité"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Premium, Standard, etc."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description de la qualité..."
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
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