"use client";

import { ColorDialog } from "./color-dialog";
import { DeleteAlert } from "@/components/delete-alert";
import { deleteWigColor } from "@/app/actions/admin-actions";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";

const ColorItem = ({ color }: { 
  color: { 
    id: string;
    name: string; 
    hexCode: string | null;
  }
}) => (
  <div className="flex flex-col h-full">
    <div className="flex-grow space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{color.name}</h3>
        {color.hexCode && (
          <div 
            className="w-6 h-6 rounded-full border"
            style={{ backgroundColor: color.hexCode }}
          />
        )}
      </div>
      <div className="text-sm text-muted-foreground min-h-[1.5rem]">
        {color.hexCode || "Aucun code hex"}
      </div>
    </div>
    <div className="flex items-center gap-2 pt-4 mt-auto">
      <ColorDialog
        mode="edit"
        color={color}
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
          const result = await deleteWigColor(color.id);
          if (!result) throw new Error(result);
        }}
        description="Cette action est irréversible. Cela supprimera définitivement la couleur et ne pourra pas être annulée."
      />
    </div>
  </div>
);

export default ColorItem; 