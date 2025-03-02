import { getBrands, getWigColors, getWigSizes, getCurrencies } from "@/app/actions/admin-actions";
import { getInfographePosts } from "@/app/actions/post-actions";
import { CreatePostForm } from "../_components/CreatePostForm";
import { DraftPostsList } from "@/app/dashboard/commercial/home/DraftPostList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function InfographeHomePage() {
    // Split currencies into two formats - one for each component
    const [brands, colors, sizes, rawCurrencies, postsResult] = await Promise.all([
        getBrands(),
        getWigColors(),
        getWigSizes(),
        getCurrencies().then(currencies => currencies.map(c => ({
            ...c,
            rate: c.rate.toString()  // Ensure rate is string
        }))),
        getInfographePosts()
    ]);

    // Convert basePrice to number for posts
    const convertedPosts = postsResult.success 
        ? postsResult.data?.map(post => ({
            ...post,
            wig: post.wig ? {
                ...post.wig,
                basePrice: post.wig.basePrice.toString(),
                currency: {
                    symbol: post.wig.currency.symbol,
                    rate: post.wig.currency.rate
                }
            } : null
        }))
        : [];

    // For DraftPostsList: convert rates to numbers
    const draftListCurrencies = rawCurrencies.map(c => ({
        id: c.id,
        symbol: c.symbol,
        rate: Number(c.rate),
        isBase: c.isBase
    }));

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Infographe Dashboard</h1>
            </div>

            <Tabs defaultValue="create" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="create">Create Post</TabsTrigger>
                    <TabsTrigger value="drafts">My Drafts</TabsTrigger>
                </TabsList>

                <TabsContent value="create">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create New Post</CardTitle>
                            <CardDescription>
                                Create a new post with wig information and media content
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CreatePostForm 
                                brands={brands}
                                colors={colors}
                                sizes={sizes}
                                currencies={rawCurrencies}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="drafts">
                    <Card>
                        <CardHeader>
                            <CardTitle>Draft Posts</CardTitle>
                            <CardDescription>
                                View and manage your draft posts
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {postsResult.success ? (
                                convertedPosts && convertedPosts.length > 0 ? (
                                    <DraftPostsList posts={convertedPosts} currencies={draftListCurrencies} />
                                ) : (
                                    <p className="text-muted-foreground text-center py-8">
                                        No draft posts yet. Create your first post!
                                    </p>
                                )
                            ) : (
                                <div className="text-red-500">{postsResult.error}</div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}