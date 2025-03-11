"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { QualityDialog } from "./quality-dialog";
import { DeleteAlert } from "@/components/delete-alert";
import { deleteWigQuality } from "@/app/actions/admin-actions";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";

export function QualitiesList({ qualities }: { 
  qualities: { 
    id: string; 
    name: string; 
    description: string | null;
    orderIndex: number;
  }[] 
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Ordre</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {qualities.map((quality) => (
          <TableRow key={quality.id}>
            <TableCell className="font-medium">{quality.name}</TableCell>
            <TableCell>{quality.description || '-'}</TableCell>
            <TableCell>{quality.orderIndex}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <QualityDialog 
                  mode="edit" 
                  quality={quality}
                  trigger={
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </Button>
                  }
                />
                <DeleteAlert 
                  triggerButton={
                    <Button variant="destructive" size="sm">
                      <Trash className="h-4 w-4 mr-2" />
                      Supprimer
                    </Button>
                  }
                  onConfirm={async () => {
                    const result = await deleteWigQuality(quality.id);
                    if (!result.success) throw new Error(result.error);
                  }}
                  description="Cette action est irréversible. Cela supprimera définitivement la qualité et ne pourra pas être annulée."
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 