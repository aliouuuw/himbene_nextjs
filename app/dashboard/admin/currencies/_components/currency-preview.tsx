"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { convertCurrency, formatCurrency } from "@/lib/currency-utils";

interface CurrencyPreviewProps {
  baseCurrency: string;
  currencies: Array<{
    id: string;
    symbol: string;
    rate: number;
  }>;
}

export function CurrencyPreview({ baseCurrency, currencies }: CurrencyPreviewProps) {
  const [amount, setAmount] = useState<number>(100);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Test Amount ({baseCurrency})</Label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          min={0}
          step={0.01}
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {currencies.map((currency) => (
          <div 
            key={currency.id} 
            className="p-4 border rounded-lg"
          >
            <div className="text-sm text-muted-foreground">{currency.id}</div>
            <div className="text-lg font-bold">
              {formatCurrency(
                convertCurrency(amount, currency.rate),
                currency.id
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
