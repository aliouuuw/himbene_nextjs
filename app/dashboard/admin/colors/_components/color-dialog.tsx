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
import { createWigColor, updateWigColor } from "@/app/actions/admin-actions";
import { toast } from "sonner";

interface ColorDialogProps {
  mode: "add" | "edit";
  color?: {
    id: string;
    name: string;
    hexCode: string | null;
  };
  trigger?: React.ReactNode;
}

export function ColorDialog({ mode, color, trigger }: ColorDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(color?.name || "");
  const [hexCode, setHexCode] = useState(color?.hexCode || "#000000");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = mode === "add" 
        ? await createWigColor(name, hexCode)
        : await updateWigColor(color!.id, name, hexCode);

      if (result.success) {
        toast.success(`Couleur ${mode === "add" ? "créée" : "modifiée"} avec succès`);
        setOpen(false);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'enregistrement de la couleur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant={mode === "edit" ? "ghost" : "default"}>
          {mode === "add" ? "Ajouter une couleur" : "Modifier"}
        </Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Ajouter une couleur" : "Modifier la couleur"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Entrez le nom de la couleur"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hexCode">Couleur</Label>
            <div className="flex gap-2">
              <Input
                id="hexCode"
                type="color"
                value={hexCode}
                onChange={(e) => setHexCode(e.target.value)}
                className="w-20"
              />
              <Input
                value={hexCode}
                onChange={(e) => setHexCode(e.target.value)}
                placeholder="#000000"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
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