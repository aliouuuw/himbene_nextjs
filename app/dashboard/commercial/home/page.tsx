import { getCommercialDraftPosts } from "@/app/actions/post-actions";
import { getCurrencies, getPostTypes, getUserBrand } from "@/app/actions/admin-actions";
import { PostWithRelations } from "@/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { getAuthenticatedUsersAccount } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserBrand } from "@prisma/client";
import { PostsTabs } from "./posts-tabs";

export default async function CommercialHomePage() {
  const account = await getAuthenticatedUsersAccount();
  const passwordChangeRequired = account?.passwordChangeRequired;
  // console.log("Password change required:", passwordChangeRequired);

  /* Redirect to change password page if password change is required */
  if (passwordChangeRequired) {
    return redirect("/change-password");
  }
  const [postsResult, currencies, userBrand, postTypes] = await Promise.all([
    getCommercialDraftPosts(),
    getCurrencies(),
    getUserBrand(),
    getPostTypes(),
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
        brands: post.brands as unknown as { brand: { id: string; name: string } }[],
        sharedBy: (post as PostWithRelations).sharedBy || [],
        isShared: Array.isArray((post as PostWithRelations).sharedBy)
          ? (post as PostWithRelations).sharedBy.some((share: { userId: string }) => share.userId === account?.id)
          : false
    })) || [])
    : [];

  // Filter posts based on shared status
  const unsharedPosts = posts?.filter((post) => post.sharedBy.length === 0) || [];
  const sharedPosts = posts?.filter((post) => post.sharedBy.length > 0) || [];

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Galerie de posts</h1>
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
            <PostsTabs
              posts={unsharedPosts}
              currencies={currencies}
              userBrand={userBrand as UserBrand}
              postTypes={postTypes}
            />
          </TabsContent>

          <TabsContent value="shared">
            <PostsTabs
              posts={sharedPosts}
              currencies={currencies}
              userBrand={userBrand as UserBrand}
              postTypes={postTypes}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
