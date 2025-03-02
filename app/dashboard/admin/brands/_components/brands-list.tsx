"use client";

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BrandDialog } from "./brand-dialog";
import { DeleteAlert } from "@/components/delete-alert";
import { deleteBrand } from "@/app/actions/admin-actions";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export function BrandsList({ brands }: { brands: { id: string; name: string; description: string; logoUrl: string; isActive: boolean }[] }) {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    await deleteBrand(id);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Brand Management</h1>
        <BrandDialog mode="add" onSuccess={() => router.refresh()} />
      </div>

      <Table>
        <TableCaption>A list of all brands</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Brand</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {brands.map((brand) => (
            <TableRow key={brand.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {brand.logoUrl && (
                    <Image
                      src={brand.logoUrl}
                      alt={brand.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  {brand.name}
                </div>
              </TableCell>
              <TableCell>{brand.description || '-'}</TableCell>
              <TableCell>
                <Badge variant={brand.isActive ? "default" : "secondary"}>
                  {brand.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <BrandDialog 
                  mode="edit" 
                  brand={brand} 
                  onSuccess={() => router.refresh()}
                />
                <DeleteAlert 
                  onConfirm={() => handleDelete(brand.id)}
                  description="This will permanently delete this brand and cannot be undone."
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 