import { getWigQualities } from "@/app/actions/admin-actions";
import { QualitiesList } from "./_components/qualities-list";

export default async function QualitiesPage() {
  const qualities = await getWigQualities();
  return <QualitiesList qualities={qualities.map(quality => ({
    ...quality,
    description: quality.description ?? ''
  }))} />;
} 