import { getWigSizes } from "@/app/actions/admin-actions";
import { SizesList } from "./_components/sizes-list";

export default async function SizesPage() {
  const sizes = await getWigSizes();
  return <SizesList sizes={sizes} />;
} 