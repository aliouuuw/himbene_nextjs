"use client";

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CurrencyDialog } from "./currency-dialog";
import { DeleteAlert } from "@/components/delete-alert";
import { deleteCurrency, syncExchangeRates } from "@/app/actions/admin-actions";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Currency } from "@prisma/client";
import { CurrencyPreview } from "./currency-preview";
import { CurrencyCode, getCurrencyFlag } from "@/lib/currency-utils";
import Image from "next/image";

// Change the Currency import to a custom type
type CurrencyWithNumberRate = Omit<Currency, 'rate'> & { rate: number };

export function CurrenciesList({ currencies }: { currencies: CurrencyWithNumberRate[] }) {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);

  const handleDelete = async (id: string) => {
    const result = await deleteCurrency(id);
    if (result.success) {
      console.log("Devise supprimée avec succès");
      router.refresh();
    } else {
      console.error(result.error || "Erreur lors de la suppression de la devise");
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await syncExchangeRates();
      if (result.success) {
        toast.success("Taux de change mis à jour avec succès");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } finally {
      setSyncing(false);
    }
  };

  const baseCurrency = currencies.find(c => c.isBase);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des devises</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleSync}
            disabled={syncing}
          >
            {syncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Actualiser les taux
          </Button>
          <CurrencyDialog mode="add" onSuccess={() => router.refresh()} />
        </div>
      </div>

      <Table>
        <TableCaption>Liste de toutes les devises</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead>Symbole</TableHead>
            <TableHead>Taux</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Dernière mise à jour</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currencies.sort((a, b) => a.isBase ? -1 : b.isBase ? 1 : 0).map((currency) => (
            <TableRow key={currency.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Image 
                    src={getCurrencyFlag(currency.id as CurrencyCode)} 
                    alt={currency.id}
                    width={24}
                    height={18}
                    className="rounded-sm"
                  />
                  {currency.id}
                </div>
              </TableCell>
              <TableCell>{currency.name}</TableCell>
              <TableCell>{currency.symbol}</TableCell>
              <TableCell>{currency.rate.toString()}</TableCell>
              <TableCell>
                <Badge variant={currency.isBase ? "default" : "outline"}>
                  {currency.isBase ? "Devise de base" : "Active"}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(currency.lastUpdated).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <CurrencyDialog 
                  mode="edit" 
                  currency={{
                    ...currency,
                    rate: Number(currency.rate)
                  }}
                  onSuccess={() => router.refresh()}
                />
                {!currency.isBase && (
                  <DeleteAlert 
                    onConfirm={() => handleDelete(currency.id)}
                    description="Cette action est irréversible. Cela supprimera définitivement la devise et ne pourra pas être annulée."
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {baseCurrency && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Conversion des devises</h2>
          <CurrencyPreview
            baseCurrency={baseCurrency.id}
            currencies={currencies.map(c => ({
              id: c.id,
              symbol: c.symbol,
              rate: Number(c.rate)
            }))}
          />
        </div>
      )}
    </div>
  );
} 