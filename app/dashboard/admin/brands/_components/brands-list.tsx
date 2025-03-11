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

  return (
    <div>
      <Table>
        <TableCaption>Liste de toutes les marques</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Marque</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Statut</TableHead>
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
                <Badge variant={brand.isActive ? "active" : "secondary"}>
                  {brand.isActive ? "Actif" : "Inactif"}
                </Badge>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <BrandDialog 
                  mode="edit" 
                  brand={brand} 
                  onSuccess={() => router.refresh()}
                />
                <DeleteAlert 
                  onConfirm={async () => {
                    const result = await deleteBrand(brand.id);
                    if (!result.success) throw new Error(result.error);
                  }}
                  description="Cette action est irréversible. Cela supprimera définitivement la marque et ne pourra pas être annulée."
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 