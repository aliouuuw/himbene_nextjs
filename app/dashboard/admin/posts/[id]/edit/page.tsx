import { getPostById } from "@/app/actions/post-actions";
import { EditPostForm } from "@/app/dashboard/admin/posts/_components/edit-post-form";

import { notFound } from "next/navigation";
import { getCurrencies, getWigQualities, getWigColors, getWigSizes } from "@/app/actions/admin-actions";
import { getPostTypes } from "@/app/actions/admin-actions";
import { PostWithRelations } from "@/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface EditPostPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditPostPage({
  params,
}: EditPostPageProps) {
  const { id } = await params;
  const post = await getPostById(id);
  
  if (!post) {
    notFound();
  }

  // Fetch all the required data for the form
  const [colors, sizes, currencies, qualities, types] = await Promise.all([
    getWigColors(),
    getWigSizes(),
    getCurrencies(),
    getWigQualities(),
    getPostTypes(),
  ]);

  return (
    <div className="py-4">
      <Link href="/dashboard/admin/posts" className="w-fit flex items-center mb-4 hover:underline group transition-transform duration-300">
            <ArrowLeft className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:translate-x-[-4px]" />
            Retour
      </Link>
      <h1 className="text-2xl font-bold mb-6">Modifier le post</h1>
      <EditPostForm
        post={post as PostWithRelations}
        colors={colors}
        sizes={sizes}
        currencies={currencies}
        qualities={qualities}
        types={types}
      />
    </div>
  );
}
