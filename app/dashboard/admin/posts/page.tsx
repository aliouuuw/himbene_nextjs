import { CreatePostForm } from "../_components/CreatePostForm";
import { getBrands, getWigColors, getWigSizes, getCurrencies } from "@/app/actions/admin-actions";

export default async function PostsPage() {
  const [brands, colors, sizes, currencies] = await Promise.all([
    getBrands(),
    getWigColors(),
    getWigSizes(),
    getCurrencies(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Post Management</h1>
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-4">Create Post</h2>
          <CreatePostForm 
            brands={brands}
            colors={colors}
            sizes={sizes}
            currencies={currencies}
          />
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-4">Published Posts</h2>
          {/* Add published posts list here */}
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-4">Scheduled Posts</h2>
          {/* Add scheduled posts list here */}
        </section>
      </div>
    </div>
  );
}