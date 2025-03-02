import { getCommercialDraftPosts } from "@/app/actions/post-actions";
import { getCurrencies } from "@/app/actions/admin-actions";
import { CommercialPostsList } from "./commercial-posts-list";
import { PostWithRelations } from "@/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default async function CommercialHomePage() {
    const [postsResult, currencies] = await Promise.all([
        getCommercialDraftPosts(),
        getCurrencies()
    ]);

    const convertedPosts = (postsResult.success 
      ? postsResult.data?.map(post => ({
          ...post,
          brand: { ...post.brand },
          wig: post.wig ? {
            ...post.wig,
            basePrice: post.wig.basePrice,
            currency: {
              symbol: post.wig.currency.symbol,
              rate: post.wig.currency.rate
            }
          } : null
        }))
      : []) as (PostWithRelations & { isShared: boolean })[];

    // Filter posts based on shared status
    const unsharedPosts = convertedPosts?.filter(post => !post.isShared) || [];
    const sharedPosts = convertedPosts?.filter(post => post.isShared) || [];

    return (
        <div className="space-y-8 p-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
                <p className="text-muted-foreground text-sm pt-3">
                    Gérer vos posts, partager ou publier
                </p>
            </div>
            <Separator />
            
            <div className="space-y-4">
                <Tabs defaultValue="to-share" className="w-full">
                    <TabsList className="bg-background">
                        <TabsTrigger value="to-share">
                            À partager
                            <span className="ml-2 text-xs rounded-full bg-muted px-2 py-0.5">
                                {unsharedPosts.length}
                            </span>
                        </TabsTrigger>
                        <TabsTrigger value="shared">
                            Partagés
                            <span className="ml-2 text-xs rounded-full bg-muted px-2 py-0.5">
                                {sharedPosts.length}
                            </span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="to-share" className="m-0 pt-3">
                        {postsResult.success ? (
                            <CommercialPostsList 
                                posts={unsharedPosts} 
                                currencies={currencies}
                            />
                        ) : (
                            <div className="text-red-500">{postsResult.error}</div>
                        )}
                    </TabsContent>

                    <TabsContent value="shared" className="m-0 pt-3">
                        <CommercialPostsList 
                            posts={sharedPosts} 
                            currencies={currencies}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}