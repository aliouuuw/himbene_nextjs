import { getBrands } from "@/app/actions/admin-actions";
import { BrandsList } from "./_components/brands-list";
import { DataGrid } from "@/app/dashboard/admin/_components/data-grid";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LayoutGrid, List } from "lucide-react";
import { BrandDialog } from "./_components/brand-dialog";
import BrandItem from "./_components/brand-item";

export default async function BrandsPage() {
  const brands = await getBrands();
  const brandsWithDefaults = brands.map(brand => ({
    ...brand,
    description: brand.description ?? '',
    logoUrl: brand.logoUrl ?? ''
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des marques</h1>
        <BrandDialog mode="add" />
      </div>

      <Tabs defaultValue="grid">
        <div className="flex justify-end mb-4">
          <TabsList>
            <TabsTrigger value="grid">
              <LayoutGrid className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="list">
              <List className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="grid">
          <DataGrid
            items={brandsWithDefaults}
            renderItem={(brand) => <BrandItem brand={brand} />}
          />
        </TabsContent>
        <TabsContent value="list">
          <BrandsList brands={brandsWithDefaults} />
        </TabsContent>
      </Tabs>
    </div>
  );
}