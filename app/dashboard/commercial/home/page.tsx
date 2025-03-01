import { getDraftPosts } from "@/app/actions/post-actions";
import { DraftPostsList } from "./DraftPostList";

export default async function CommercialHomePage() {
    const result = await getDraftPosts();
    
    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Dashboard</h1>
            </div>
            
            <div className="grid gap-6">
                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">Posts to Publish</h2>
                    {result.success ? (
                        <DraftPostsList posts={result.data || []} />
                    ) : (
                        <div className="text-red-500">{result.error}</div>
                    )}
                </div>
            </div>
        </div>
    );
}