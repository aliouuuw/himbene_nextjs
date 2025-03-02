import { getBrands, getCurrencies, getWigSizes, getWigColors } from "@/app/actions/admin-actions";
import { getInfographePosts } from "@/app/actions/post-actions";
import { PostWithRelations, Currency } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { InfographePostsList } from "./_components/infographe-posts-list";
import { CreatePostButton } from "./_components/create-post-button";
import { Separator } from "@/components/ui/separator";

// Create a reusable component for TabsContent
function PostsTabsContent({ value, posts, currencies, error }: { value: string, posts: PostWithRelations[], currencies: Currency[], error: string }) {
    return (
        <TabsContent value={value} className="m-0">
            {posts.length > 0 ? (
                <InfographePostsList 
                    posts={posts}
                    currencies={currencies}
                />
            ) : (
                <Card>
                    <CardContent className="flex items-center justify-center h-32">
                        <div className="text-red-500">{error}</div>
                    </CardContent>
                </Card>
            )}
        </TabsContent>
    );
}

export default async function InfographeHomePage() {
    const [postsResult, rawCurrencies] = await Promise.all([
        getInfographePosts(),
        getCurrencies()
    ]);

    // Convert currencies to the correct format
    const currencies: Currency[] = rawCurrencies.map(c => ({
        ...c,
        rate: Number(c.rate),
        lastUpdated: new Date(c.lastUpdated)
    }));
    const [brands, colors, sizes] = await Promise.all([
        getBrands(),
        getWigColors(),
        getWigSizes()
    ]);

    // No need to convert posts since getInfographePosts now returns the correct format
    const posts: PostWithRelations[] = postsResult.success 
        ? (postsResult.data?.map(post => ({
            ...post,
            wig: post.wig ? {
                ...post.wig,
                basePrice: Number(post.wig.basePrice),
                currency: post.wig.currency as unknown as { id: string; symbol: string; rate: number }
            } : null
        })) || [])
        : [];

    return (
        <div className="h-full space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Infographe Dashboard</h1>
                <p className="text-muted-foreground">
                    Manage your posts and create new content
                </p>
            </div>
            <Separator />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Tabs defaultValue="all" className="w-full">
                        <div className="flex items-center justify-between mb-4">
                            <TabsList className="bg-background">
                                <TabsTrigger value="all" className="relative">
                                    All Posts
                                    <span className="ml-2 text-xs rounded-full bg-muted px-2 py-0.5">
                                        {posts.length}
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger value="drafts">
                                    Drafts
                                    <span className="ml-2 text-xs rounded-full bg-muted px-2 py-0.5">
                                        {posts.filter(post => post.status === "DRAFT").length}
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger value="published">
                                    Published
                                    <span className="ml-2 text-xs rounded-full bg-muted px-2 py-0.5">
                                        {posts.filter(post => post.status === "PUBLISHED").length}
                                    </span>
                                </TabsTrigger>
                            </TabsList>
                            <CreatePostButton currencies={currencies} brands={brands} colors={colors} sizes={sizes} />
                        </div>

                        <PostsTabsContent 
                            value="all" 
                            posts={posts} 
                            currencies={currencies} 
                            error={postsResult.error || ""} 
                        />
                        <PostsTabsContent 
                            value="drafts" 
                            posts={posts.filter(post => post.status === "DRAFT")} 
                            currencies={currencies} 
                            error={postsResult.error || ""} 
                        />
                        <PostsTabsContent 
                            value="published" 
                            posts={posts.filter(post => post.status === "PUBLISHED")} 
                            currencies={currencies} 
                            error={postsResult.error || ""} 
                        />
                    </Tabs>
                </div>
            </div>
        </div>
    );
}