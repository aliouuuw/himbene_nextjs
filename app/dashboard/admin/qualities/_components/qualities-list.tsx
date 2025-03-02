"use client";

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { QualityDialog } from "./quality-dialog";
import { DeleteAlert } from "@/components/delete-alert";
import { deleteWigQuality } from "@/app/actions/admin-actions";
import { useRouter } from "next/navigation";

export function QualitiesList({ qualities }: { qualities: { id: string; name: string; description: string | null; }[] }) {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    await deleteWigQuality(id);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des qualités</h1>
        <QualityDialog mode="add" onSuccess={() => router.refresh()} />
      </div>

      <Table>
        <TableCaption>Liste de toutes les qualités</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {qualities.map((quality) => (
            <TableRow key={quality.id}>
              <TableCell className="font-medium">{quality.name}</TableCell>
              <TableCell>{quality.description || '-'}</TableCell>
              <TableCell className="text-right space-x-2">
                <QualityDialog 
                  mode="edit" 
                  quality={quality} 
                  onSuccess={() => router.refresh()}
                />
                <DeleteAlert 
                  onConfirm={() => handleDelete(quality.id)}
                  description="Cette action est irréversible. Cela supprimera définitivement la qualité et ne pourra pas être annulée."
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 