import {
  getAdminPosts,
  getPublishedPosts,
  getScheduledPosts,
} from "@/app/actions/post-actions";
import { InfographePostsList } from "../../infographe/home/_components/infographe-posts-list";
import { PostWithRelations } from "@/types";
import { getCurrencies, getWigQualities, getBrands } from "@/app/actions/admin-actions";

export default async function PostsPage() {
  const [drafts, published, scheduled, currenciesResult, qualitiesResult, brandsResult] = await Promise.all([
    getAdminPosts(),
    getPublishedPosts(),
    getScheduledPosts(),
    getCurrencies(),
    getWigQualities(),
    getBrands(),
  ]);

  // Combine all posts
  const allPosts = [
    ...(drafts.success ? drafts.data || [] : []),
    ...(published.success ? published.data || [] : []),
    ...(scheduled.success ? scheduled.data || [] : []),
  ];

  // Convert Decimal objects to numbers for serialization in posts
  const serializedPosts = allPosts.map(post => ({
    ...post,
    wig: post.wig ? {
      ...post.wig,
      basePrice: post.wig.basePrice ? Number(post.wig.basePrice) : null,
      currency: post.wig.currency ? {
        ...post.wig.currency,
        rate: post.wig.currency.rate ? Number(post.wig.currency.rate) : null
      } : null,
      quality: post.wig.quality as unknown as { id: string; name: string; orderIndex: number }
    } : null,
    brands: post.brands as unknown as { brand: { id: string; name: string } }[],
    brandIds: post.brands?.map(b => b.brand.name) || []
  }));

  // Also convert Decimal objects in currencies array
  const currencies = currenciesResult 
    ? currenciesResult.map(currency => ({
        ...currency,
        rate: Number(currency.rate)
      }))
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gestion des posts</h1>
      <div className="space-y-6">
        <InfographePostsList posts={serializedPosts as unknown as PostWithRelations[]} currencies={currencies} qualities={qualitiesResult} brands={brandsResult}  />
      </div>
    </div>
  );
}
