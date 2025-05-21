import { getCurrencies, getPostTypes, getWigQualities, getWigColors, getWigSizes } from "@/app/actions/admin-actions";
import { CreatePostForm } from "../_components/create-post-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function NewPostPage() {
  const [
    currenciesResult,
    qualitiesResult,
    typesResult,
    colorsResult,
    sizesResult,
  ] = await Promise.all([
    getCurrencies(),
    getWigQualities(),
    getPostTypes(),
    getWigColors(),
    getWigSizes(),
  ]);

  // Convert Decimal objects in currencies array
  const currencies = currenciesResult
    ? currenciesResult.map((currency) => ({
        ...currency,
        rate: Number(currency.rate),
      }))
    : [];
  
  const qualities = qualitiesResult || [];
  const types = typesResult || [];
  const colors = colorsResult || [];
  const sizes = sizesResult || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/admin/posts">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Créer un nouveau post</h1>
      </div>
      <CreatePostForm
        currencies={currencies}
        qualities={qualities}
        types={types}
        colors={colors}
        sizes={sizes}
      />
    </div>
  );
}
