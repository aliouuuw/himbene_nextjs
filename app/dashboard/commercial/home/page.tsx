import { getCommercialDraftPosts } from "@/app/actions/post-actions";
import { getCurrencies } from "@/app/actions/admin-actions";
import { CommercialPostsList } from "./commercial-posts-list";
import { PostWithRelations } from "@/types";

export default async function CommercialHomePage() {
    const [postsResult, currencies] = await Promise.all([
        getCommercialDraftPosts(),
        getCurrencies()
    ]);

    // Convert basePrice to number before passing to DraftPostsList
    const convertedPosts = postsResult.success 
      ? postsResult.data?.map(post => ({
          ...post,
          brand: { ...post.brand },  // Ensure brand is included
          wig: post.wig ? {
            ...post.wig,
            basePrice: post.wig.basePrice,  // Keep as string
            currency: {
              symbol: post.wig.currency.symbol,
              rate: post.wig.currency.rate   // Keep as string
            }
          } : null
        }))
      : [];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Commercial Dashboard</h1>
            </div>
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Posts to Publish</h2>
                {postsResult.success ? (
                    <CommercialPostsList 
                        posts={convertedPosts as PostWithRelations[] || []} 
                        currencies={currencies}
                    />
                ) : (
                    <div className="text-red-500">{postsResult.error}</div>
                )}
            </div>
        </div>
    );
}