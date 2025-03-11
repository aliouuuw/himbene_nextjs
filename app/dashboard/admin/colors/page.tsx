import { getWigColors } from "@/app/actions/admin-actions";
import { ColorsList } from "./_components/colors-list";
import { DataGrid } from "@/app/dashboard/admin/_components/data-grid";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LayoutGrid, List } from "lucide-react";
import { ColorDialog } from "./_components/color-dialog";
import ColorItem from "./_components/color-item";

export default async function ColorsPage() {
  const colors = await getWigColors();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des couleurs</h1>
        <ColorDialog mode="add" />
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
            items={colors}
            renderItem={(color) => <ColorItem color={color} />}
          />
        </TabsContent>
        <TabsContent value="list">
          <ColorsList colors={colors} />
        </TabsContent>
      </Tabs>
    </div>
  );
}