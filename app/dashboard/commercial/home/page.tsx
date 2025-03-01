import { getDraftPosts } from "@/app/actions/post-actions";
import { DraftPostsList } from "./DraftPostList";

export default async function CommercialHomePage() {
    const result = await getDraftPosts();

    // Convert basePrice to number before passing to DraftPostsList
    const convertedPosts = result.success 
      ? result.data?.map(post => ({
          ...post,
          wig: post.wig ? {
            ...post.wig,
            basePrice: Number(post.wig.basePrice), // Convert string to number
            currency: {
              ...post.wig.currency,
              rate: post.wig.currency.rate // Keep as string if needed for display
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
                {result.success ? (
                    <DraftPostsList posts={convertedPosts || []} />
                ) : (
                    <div className="text-red-500">{result.error}</div>
                )}
            </div>
        </div>
    );
}