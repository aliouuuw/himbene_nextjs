import { getWigSizes } from "@/app/actions/admin-actions";
import { SizesList } from "./_components/sizes-list";
import { DataGrid } from "@/app/dashboard/admin/_components/data-grid";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LayoutGrid, List } from "lucide-react";
import { SizeDialog } from "./_components/size-dialog";
import SizeItem from "./_components/size-item";

export default async function SizesPage() {
  const sizes = await getWigSizes();
  const sizesWithDefaults = sizes.map(size => ({
    ...size,
    description: size.description ?? ''
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des tailles</h1>
        <SizeDialog mode="add" />
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
            items={sizesWithDefaults}
            renderItem={(size) => <SizeItem size={size} />}
          />
        </TabsContent>
        <TabsContent value="list">
          <SizesList sizes={sizesWithDefaults} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 