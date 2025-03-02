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
import { Switch } from "@/components/ui/switch";
import { createBrand, updateBrand } from "@/app/actions/admin-actions";
import { toast } from "sonner";

interface BrandDialogProps {
  mode: "add" | "edit";
  brand?: {
    id: string;
    name: string;
    description: string | null;
    logoUrl: string | null;
    isActive: boolean;
  };
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function BrandDialog({ mode, brand, onSuccess, trigger }: BrandDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(brand?.name || "");
  const [description, setDescription] = useState(brand?.description || "");
  const [logoUrl, setLogoUrl] = useState(brand?.logoUrl || "");
  const [isActive, setIsActive] = useState(brand?.isActive ?? true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = mode === "add" 
        ? await createBrand({ name, description, logoUrl, isActive })
        : await updateBrand(brand!.id, { name, description, logoUrl, isActive });

      if (result.success) {
        toast.success(`Marque ${mode === "add" ? "créée" : "modifiée"} avec succès`);
        setOpen(false);
        onSuccess?.();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'enregistrement de la marque");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant={mode === "edit" ? "ghost" : "default"}>
          {mode === "add" ? "Ajouter une marque" : "Modifier"}
        </Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Ajouter une marque" : "Modifier la marque"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Entrez le nom de la marque"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Entrez la description de la marque"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input
              id="logoUrl"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="Entrez l'URL du logo"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="isActive">Actif</Label>
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