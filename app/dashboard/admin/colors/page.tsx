import { getWigColors } from "@/app/actions/admin-actions";
import { ColorsList } from "./_components/colors-list";

export default async function ColorsPage() {
  const colors = await getWigColors();
  
  return <ColorsList colors={colors} />;
} 