import { getWigQualities } from "@/app/actions/admin-actions";
import { QualitiesList } from "./_components/qualities-list";
import { DataGrid } from "@/app/dashboard/admin/_components/data-grid";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LayoutGrid, List } from "lucide-react";
import { QualityDialog } from "./_components/quality-dialog";
import QualityItem from "./_components/quality-item";

export default async function QualitiesPage() {
  const qualities = await getWigQualities();
  const qualitiesWithDefaults = qualities.map((quality) => ({
    ...quality,
    description: quality.description ?? "",
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des qualités</h1>
        <QualityDialog mode="add" />
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
            items={qualitiesWithDefaults}
            renderItem={(quality) => <QualityItem quality={quality} />}
          />
        </TabsContent>
        <TabsContent value="list">
          <QualitiesList qualities={qualitiesWithDefaults} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
