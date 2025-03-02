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
import { Switch } from "@/components/ui/switch";
import { createCurrency, updateCurrency } from "@/app/actions/admin-actions";
import { toast } from "sonner";
import { VALID_CURRENCIES } from "@/lib/currency-utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CurrencyDialogProps {
  mode: "add" | "edit";
  currency?: {
    id: string;
    name: string;
    symbol: string;
    rate: number;
    isBase: boolean;
  };
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function CurrencyDialog({ mode, currency, onSuccess, trigger }: CurrencyDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState(currency?.id || ""); // e.g., "USD"
  const [name, setName] = useState(currency?.name || "");
  const [symbol, setSymbol] = useState(currency?.symbol || "");
  const [isBase, setIsBase] = useState(currency?.isBase || false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = mode === "add" 
        ? await createCurrency({ id, name, symbol, isBase })
        : await updateCurrency(currency!.id, { name, symbol, isBase });

      if (result.success) {
        toast.success(`Devise ${mode === "add" ? "créée" : "modifiée"} avec succès`);
        setOpen(false);
        onSuccess?.();
      } else {
        toast.error(result.error || `Erreur lors de l'${mode === "add" ? "création" : "mise à jour"} de la devise`);
      }
    } catch (error) {
      console.error(error);
      toast.error(`Erreur lors de l'${mode === "add" ? "création" : "mise à jour"} de la devise`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant={mode === "edit" ? "ghost" : "default"}>
          {mode === "add" ? "Ajouter une devise" : "Modifier"}
        </Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Ajouter une devise" : "Modifier la devise"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "add" && (
            <div className="space-y-2">
              <Label htmlFor="id">Code de la devise</Label>
              <Select
                value={id}
                onValueChange={setId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une devise" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(VALID_CURRENCIES).map(([code, name]) => (
                    <SelectItem key={code} value={code}>
                      {code} - {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Franc CFA"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="symbol">Symbole</Label>
            <Input
              id="symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="$"
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isBase"
              checked={isBase}
              onCheckedChange={setIsBase}
              disabled={currency?.isBase} // Can't unset base currency
            />
            <Label htmlFor="isBase">Devise de base</Label>
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