/*eslint-disable @typescript-eslint/no-explicit-any*/

import { getBrands, getCurrencies, getWigSizes, getWigColors, getWigQualities, getUserBrand } from "@/app/actions/admin-actions";
import { getInfographePosts } from "@/app/actions/post-actions";
import { PostWithRelations, Currency } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InfographePostsList } from "./_components/infographe-posts-list";
import { CreatePostButton } from "./_components/create-post-button";
import { Separator } from "@/components/ui/separator";
import { WigQuality, Brand, UserBrand } from "@prisma/client";
import { getAuthenticatedUsersAccount } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LayoutGrid, List } from "lucide-react";
import { InfographePostsGrid } from "./_components/infographe-posts-grid";

// Create a reusable component for TabsContent
function PostsTabsContent({ value, posts, currencies, qualities, brands, error, userBrand }: { value: string, posts: PostWithRelations[], currencies: Currency[], qualities: WigQuality[], brands: Brand[], error: string, userBrand: UserBrand }) {
    return (
        <TabsContent value={value} className="m-0">
            {posts.length > 0 ? (
                <Tabs defaultValue="grid">
                    <div className="flex justify-end mb-4">
                        <TabsList>
                            <TabsTrigger value="grid">
                                <LayoutGrid className="h-4 w-4" />
                            </TabsTrigger>
                            <TabsTrigger value="list">
                                <List className="h-4 w-4" />
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="grid">
                        <InfographePostsGrid 
                            posts={posts}
                            currencies={currencies}
                            qualities={qualities}
                            brands={brands}
                            userBrand={userBrand}
                        />
                    </TabsContent>
                    <TabsContent value="list">
                        <InfographePostsList 
                            posts={posts}
                            currencies={currencies}
                            qualities={qualities}
                            brands={brands}
                            userBrand={userBrand}
                        />
                    </TabsContent>
                </Tabs>
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
  const account = await getAuthenticatedUsersAccount()
  const passwordChangeRequired = account?.passwordChangeRequired
  // console.log("Password change required:", passwordChangeRequired);

  /* Redirect to change password page if password change is required */
  if (passwordChangeRequired) {
    return redirect("/change-password");
  }
  const userBrand = await getUserBrand();
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
            } : null,
            brandIds: post.brands?.map(b => b.brand.name) || [],
            brands: post.brands as unknown as { brand: { id: string; name: string } }[],
            sharedBy: (post as any).sharedBy || [],
            isShared: (post as any).sharedBy?.some((share: any) => share.userId === account?.id) || false
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
                            <div>
                                Tous les posts
                                <span className="ml-2 text-xs rounded-full bg-muted px-2 py-0.5">
                                    {posts.length}
                                </span>
                            </div>
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
                            brands={brands}
                            userBrand={userBrand as UserBrand}
                            error={postsResult.error || ""} 
                        />
                    </Tabs>
                </div>
            </div>
        </div>
    );
}