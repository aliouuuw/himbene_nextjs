import { getCommercialDraftPosts } from "@/app/actions/post-actions";
import { getCurrencies, getUserBrand } from "@/app/actions/admin-actions";
import { PostWithRelations } from "@/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { LayoutGrid, List } from "lucide-react";
import { CommercialPostsGrid } from "./commercial-posts-grid";
import { CommercialPostsList } from "./commercial-posts-list";
import { getAuthenticatedUsersAccount } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserBrand } from "@prisma/client";
export default async function CommercialHomePage() {
  const account = await getAuthenticatedUsersAccount();
  const passwordChangeRequired = account?.passwordChangeRequired;
  // console.log("Password change required:", passwordChangeRequired);

  /* Redirect to change password page if password change is required */
  if (passwordChangeRequired) {
    return redirect("/change-password");
  }
  const [postsResult, currencies, userBrand] = await Promise.all([
    getCommercialDraftPosts(),
    getCurrencies(),
    getUserBrand(),
  ]);

  //
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
        brands: post.brands as unknown as { brand: { id: string; name: string } }[]
    })) || [])
    : [];

  //console.log(posts);

  // Filter posts based on shared status
  const unsharedPosts = posts?.filter((post) => !post.isShared) || [];
  const sharedPosts = posts?.filter((post) => post.isShared) || [];

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
        <Tabs defaultValue="to-share">
          <div className="flex justify-between items-center mb-4">
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
          </div>

          <TabsContent value="to-share">
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
                <CommercialPostsGrid
                  posts={unsharedPosts}
                  currencies={currencies}
                  userBrand={userBrand as UserBrand}
                />
              </TabsContent>
              <TabsContent value="list">
                <CommercialPostsList
                  posts={unsharedPosts}
                  currencies={currencies}
                  userBrand={userBrand as UserBrand}
                />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="shared">
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
                <CommercialPostsGrid
                  posts={sharedPosts}
                  currencies={currencies}
                  userBrand={userBrand as UserBrand}
                />
              </TabsContent>
              <TabsContent value="list">
                <CommercialPostsList
                  posts={sharedPosts}
                  currencies={currencies}
                  userBrand={userBrand as UserBrand}
                />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
