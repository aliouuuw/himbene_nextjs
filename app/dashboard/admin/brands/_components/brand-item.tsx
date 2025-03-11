"use client";

import { BrandDialog } from "./brand-dialog";
import { DeleteAlert } from "@/components/delete-alert";
import { deleteBrand } from "@/app/actions/admin-actions";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

const BrandItem = ({ brand }: { 
  brand: { 
    id: string;
    name: string;
    description: string;
    logoUrl: string;
    isActive: boolean;
  }
}) => (
  <div className="flex flex-col h-full">
    <div className="flex-grow space-y-3">
      <div className="flex items-center gap-3">
        {brand.logoUrl && (
          <div className="relative w-8 h-8">
            <Image
              src={brand.logoUrl}
              alt={brand.name}
              fill
              className="object-contain rounded-full"
            />
          </div>
        )}
        <div>
          <h3 className="font-medium">{brand.name}</h3>
          <Badge variant={brand.isActive ? "active" : "secondary"} className="mt-1">
            {brand.isActive ? "Actif" : "Inactif"}
          </Badge>
        </div>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
        {brand.description || "Aucune description"}
      </p>
    </div>
    <div className="flex items-center gap-2 pt-4 mt-auto">
      <BrandDialog
        mode="edit"
        brand={brand}
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
          const result = await deleteBrand(brand.id);
          if (!result.success) throw new Error(result.error);
        }}
        description="Cette action est irréversible. Cela supprimera définitivement la marque et ne pourra pas être annulée."
      />
    </div>
  </div>
);

export default BrandItem; 