import {
  getAdminPosts,
  getPublishedPosts,
  getScheduledPosts,
} from "@/app/actions/post-actions";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LayoutGrid, List } from "lucide-react";
import { getCurrencies, getUserBrand } from "@/app/actions/admin-actions";
import { PostWithRelations } from "@/types";
import { UserBrand } from "@prisma/client";
import { InfographePostsList } from "../../infographe/home/_components/infographe-posts-list";
import { getWigQualities, getBrands } from "@/app/actions/admin-actions";
import PostItem from "./_components/post-item";
import { DataGrid } from "../_components/data-grid";
export default async function PostsPage() {
  const [
    drafts,
    published,
    scheduled,
    currenciesResult,
    userBrand,
    qualities,
    brands,
  ] = await Promise.all([
    getAdminPosts(),
    getPublishedPosts(),
    getScheduledPosts(),
    getCurrencies(),
    getUserBrand(),
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
  const serializedPosts = allPosts.map((post) => ({
    ...post,
    wig: post.wig
      ? {
          ...post.wig,
          basePrice: post.wig.basePrice ? Number(post.wig.basePrice) : null,
          currency: post.wig.currency
            ? {
                ...post.wig.currency,
                rate: post.wig.currency.rate
                  ? Number(post.wig.currency.rate)
                  : null,
              }
            : null,
          quality: post.wig.quality,
        }
      : null,
    brands: post.brands,
    brandIds: post.brands?.map((b) => b.brand.name) || [],
  }));

  // Also convert Decimal objects in currencies array
  const currencies = currenciesResult
    ? currenciesResult.map((currency) => ({
        ...currency,
        rate: Number(currency.rate),
      }))
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gestion des posts</h1>

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
          <DataGrid
            items={serializedPosts as unknown as PostWithRelations[]}
            renderItem={(post) => <PostItem post={post} currencies={currencies} userBrand={userBrand as UserBrand} />}
          />
        </TabsContent>
        <TabsContent value="list">
        <div className="space-y-6">
            <InfographePostsList posts={serializedPosts as unknown as PostWithRelations[]} currencies={currencies} userBrand={userBrand as UserBrand} qualities={qualities} brands={brands} />
        </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
