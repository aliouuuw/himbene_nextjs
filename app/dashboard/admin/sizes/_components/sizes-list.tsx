"use client";

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SizeDialog } from "./size-dialog";
import { DeleteAlert } from "@/components/delete-alert";
import { deleteWigSize } from "@/app/actions/admin-actions";
import { useRouter } from "next/navigation";

export function SizesList({ sizes }: { sizes: { id: string; name: string; description: string | null }[] }) {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    await deleteWigSize(id);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des tailles</h1>
        <SizeDialog mode="add" onSuccess={() => router.refresh()} />
      </div>

      <Table>
        <TableCaption>Liste de toutes les tailles de perruque</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sizes.map((size) => (
            <TableRow key={size.id}>
              <TableCell className="font-medium">{size.name}</TableCell>
              <TableCell>{size.description || '-'}</TableCell>
              <TableCell className="text-right space-x-2">
                <SizeDialog 
                  mode="edit" 
                  size={size} 
                  onSuccess={() => router.refresh()}
                />
                <DeleteAlert 
                  onConfirm={() => handleDelete(size.id)}
                  description="Cette action est irréversible. Cela supprimera définitivement la taille et ne pourra pas être annulée."
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 