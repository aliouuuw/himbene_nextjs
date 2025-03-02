import { getBrands } from "@/app/actions/admin-actions";
import { BrandsList } from "./_components/brands-list";

export default async function BrandsPage() {
  const brands = await getBrands();
  return <BrandsList brands={brands.map(brand => ({
    ...brand,
    description: brand.description ?? '',
    logoUrl: brand.logoUrl ?? ''
  }))} />;
} 