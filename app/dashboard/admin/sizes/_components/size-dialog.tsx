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
import { createWigSize, updateWigSize } from "@/app/actions/admin-actions";
import { toast } from "sonner";

interface SizeDialogProps {
  mode: "add" | "edit";
  size?: {
    id: string;
    name: string;
    description: string | null;
  };
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function SizeDialog({ mode, size, onSuccess, trigger }: SizeDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(size?.name || "");
  const [description, setDescription] = useState(size?.description || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = mode === "add" 
        ? await createWigSize(name, description)
        : await updateWigSize(size!.id, name, description);

      if (result.success) {
        toast.success(`Taille ${mode === "add" ? "créée" : "modifiée"} avec succès`);
        setOpen(false);
        onSuccess?.();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'enregistrement de la taille");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant={mode === "edit" ? "ghost" : "default"}>
          {mode === "add" ? "Ajouter une taille" : "Modifier"}
        </Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Ajouter une taille" : "Modifier la taille"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Entrez le nom de la taille"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Entrez la description de la taille"
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