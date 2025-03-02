"use client";

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ColorDialog } from "./color-dialog";
import { DeleteAlert } from "@/components/delete-alert";
import { deleteWigColor } from "@/app/actions/admin-actions";
import { useRouter } from "next/navigation";


export function ColorsList({ colors }: { colors: { id: string; name: string; hexCode: string | null }[] }) {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    await deleteWigColor(id);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des couleurs</h1>
        <ColorDialog mode="add" onSuccess={() => router.refresh()} />
      </div>

      <Table>
        <TableCaption>Liste de toutes les couleurs de perruque</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Couleur</TableHead>
            <TableHead>Code Hex</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {colors.map((color) => (
            <TableRow key={color.id}>
              <TableCell className="font-medium">{color.name}</TableCell>
              <TableCell>
                <div 
                  className="w-6 h-6 rounded-full" 
                  style={{ backgroundColor: color.hexCode || '#000000' }} 
                />
              </TableCell>
              <TableCell>{color.hexCode || '-'}</TableCell>
              <TableCell className="text-right space-x-2">
                <ColorDialog 
                  mode="edit" 
                  color={color} 
                  onSuccess={() => {
                    router.refresh();
                  }}
                />
                <DeleteAlert 
                  onConfirm={() => handleDelete(color.id)}
                  description="Cette action est irréversible. Cela supprimera définitivement la couleur et ne pourra pas être annulée."
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>  
    </div>
  );
} 