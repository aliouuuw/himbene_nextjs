import { getBrands, getCurrencies, getWigSizes, getWigColors, getWigQualities } from "@/app/actions/admin-actions";
import { getInfographePosts } from "@/app/actions/post-actions";
import { PostWithRelations, Currency } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InfographePostsList } from "./_components/infographe-posts-list";
import { CreatePostButton } from "./_components/create-post-button";
import { Separator } from "@/components/ui/separator";
import { WigQuality } from "@prisma/client";

// Create a reusable component for TabsContent
function PostsTabsContent({ value, posts, currencies, qualities, error }: { value: string, posts: PostWithRelations[], currencies: Currency[], qualities: WigQuality[], error: string }) {
    return (
        <TabsContent value={value} className="m-0">
            {posts.length > 0 ? (
                <InfographePostsList 
                    posts={posts}
                    currencies={currencies}
                    qualities={qualities}
                />
            ) : (
                <div className="flex items-center justify-center h-32">
                    <div className="text-center py-10 text-muted-foreground">No posts available</div>
                    <p className="text-red-500 text-sm">{error}</p>
                </div>
            )}
        </TabsContent>
    );
}

export default async function InfographeHomePage() {
    const [postsResult, rawCurrencies] = await Promise.all([
        getInfographePosts(),
        getCurrencies(),
    ]);

    // Convert currencies to the correct format
    const currencies: Currency[] = rawCurrencies.map(c => ({
        ...c,
        rate: Number(c.rate),
        lastUpdated: new Date(c.lastUpdated)
    }));
    const [brands, colors, sizes, qualities] = await Promise.all([
        getBrands(),
        getWigColors(),
        getWigSizes(),
        getWigQualities()
    ]);

    // Update the mapping to ensure mediaUrls is a string array
    const posts: PostWithRelations[] = postsResult.success 
        ? (postsResult.data?.map(post => ({
            ...post,
            mediaUrls: Array.isArray(post.mediaUrls) 
                ? post.mediaUrls.filter(url => typeof url === 'string') as string[]
                : [],
            wig: post.wig ? {
                ...post.wig,
                basePrice: Number(post.wig.basePrice),
                currency: post.wig.currency as unknown as { id: string; symbol: string; rate: number },
                quality: post.wig.quality as unknown as { id: string; name: string; orderIndex: number }
            } : null
        })) || [])
        : [];

    return (
        <div className="h-full space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
                <p className="text-muted-foreground text-sm pt-3">
                    Gérer vos posts et créer du contenu
                </p>
            </div>
            <Separator />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Tabs defaultValue="all" className="w-full">
                        <div className="flex items-center justify-between mb-4">
                            <TabsList className="bg-background">
                                <TabsTrigger value="all" className="relative">
                                    Tous les posts
                                    <span className="ml-2 text-xs rounded-full bg-muted px-2 py-0.5">
                                        {posts.length}
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger value="drafts">
                                    Brouillons
                                    <span className="ml-2 text-xs rounded-full bg-muted px-2 py-0.5">
                                        {posts.filter(post => post.status === "DRAFT").length}
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger value="published">
                                    Publiés
                                    <span className="ml-2 text-xs rounded-full bg-muted px-2 py-0.5">
                                        {posts.filter(post => post.status === "PUBLISHED").length}
                                    </span>
                                </TabsTrigger>
                            </TabsList>
                            <CreatePostButton 
                                currencies={currencies} 
                                brands={brands} 
                                colors={colors} 
                                sizes={sizes} 
                                qualities={qualities} 
                            />
                        </div>

                        <PostsTabsContent 
                            value="all" 
                            posts={posts} 
                            currencies={currencies} 
                            qualities={qualities}
                            error={postsResult.error || ""} 
                        />
                        <PostsTabsContent 
                            value="drafts" 
                            posts={posts.filter(post => post.status === "DRAFT")} 
                            currencies={currencies} 
                            qualities={qualities}
                            error={postsResult.error || ""} 
                        />
                        <PostsTabsContent 
                            value="published" 
                            posts={posts.filter(post => post.status === "PUBLISHED")} 
                            currencies={currencies} 
                            qualities={qualities}
                            error={postsResult.error || ""} 
                        />
                    </Tabs>
                </div>
            </div>
        </div>
    );
}