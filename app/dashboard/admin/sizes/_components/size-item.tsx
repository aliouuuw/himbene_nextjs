"use client";

import { Badge } from "@/components/ui/badge";
import { SizeDialog } from "./size-dialog";
import { DeleteAlert } from "@/components/delete-alert";
import { deleteWigSize } from "@/app/actions/admin-actions";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";

const SizeItem = ({ size }: { 
  size: { 
    id: string; 
    name: string; 
    description: string | null;
    orderIndex: number;
  }
}) => (
  <div className="flex flex-col h-full">
    <div className="flex-grow space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{size.name}</h3>
        <Badge variant="secondary">Ordre: {size.orderIndex}</Badge>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
        {size.description || "Aucune description"}
      </p>
    </div>
    <div className="flex items-center gap-2 pt-4 mt-auto">
      <SizeDialog
        mode="edit"
        size={size}
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
          const result = await deleteWigSize(size.id);
          if (!result.success) throw new Error(result.error);
        }}
        description="Cette action est irréversible. Cela supprimera définitivement la taille et ne pourra pas être annulée."
      />
    </div>
  </div>
);

export default SizeItem; 