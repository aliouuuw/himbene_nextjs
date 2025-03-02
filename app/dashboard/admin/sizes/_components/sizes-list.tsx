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
        <h1 className="text-2xl font-bold">Size Management</h1>
        <SizeDialog mode="add" onSuccess={() => router.refresh()} />
      </div>

      <Table>
        <TableCaption>A list of all wig sizes</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
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
                  description="This will permanently delete this size and cannot be undone."
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 