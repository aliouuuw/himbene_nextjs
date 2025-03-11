"use client";

import { Badge } from "@/components/ui/badge";
import { QualityDialog } from "./quality-dialog";
import { DeleteAlert } from "@/components/delete-alert";
import { deleteWigQuality } from "@/app/actions/admin-actions";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";

const QualityItem = ({
  quality,
}: {
  quality: {
    id: string;
    name: string;
    description: string | null;
    orderIndex: number;
  };
}) => (
  <div className="flex flex-col h-full">
    <div className="flex-grow space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{quality.name}</h3>
        <Badge variant="secondary">Ordre: {quality.orderIndex}</Badge>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
        {quality.description || "Aucune description"}
      </p>
    </div>
    <div className="flex items-center gap-2 pt-4 mt-auto">
      <QualityDialog
        mode="edit"
        quality={quality}
        trigger={
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        }
      />
      <DeleteAlert
        triggerButton={
          <Button variant="destructive" size="sm">
            <Trash className="h-4 w-4" />
          </Button>
        }
        onConfirm={async () => {
          const result = await deleteWigQuality(quality.id);
          if (!result.success) throw new Error(result.error);
        }}
        description="Cette action est irréversible. Cela supprimera définitivement la qualité et ne pourra pas être annulée."
      />
    </div>
  </div>
);

export default QualityItem;
