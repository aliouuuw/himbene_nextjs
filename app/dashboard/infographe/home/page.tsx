import { getBrands, getWigColors, getWigSizes, getCurrencies } from "@/app/actions/admin-actions";
import { getInfographePosts } from "@/app/actions/post-actions";
import { CreatePostForm } from "../_components/CreatePostForm";
import { DraftPostsList } from "@/app/dashboard/commercial/home/DraftPostList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function InfographeHomePage() {
    // Fetch all necessary data
    const [brands, colors, sizes, currencies, postsResult] = await Promise.all([
        getBrands(),
        getWigColors(),
        getWigSizes(),
        getCurrencies(),
        getInfographePosts()
    ]);

    // Convert basePrice to number for posts
    const convertedPosts = postsResult.success 
        ? postsResult.data?.map(post => ({
            ...post,
            wig: post.wig ? {
                ...post.wig,
                basePrice: Number(post.wig.basePrice),
                currency: {
                    ...post.wig.currency,
                    rate: post.wig.currency.rate
                }
            } : null
        }))
        : [];

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
                                currencies={currencies}
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
                                    <DraftPostsList posts={convertedPosts} />
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