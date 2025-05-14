import {
  getAdminPosts,
  getPublishedPosts,
  getScheduledPosts,
} from "@/app/actions/post-actions";
import { getCurrencies, getPostTypes, getUserBrand, getWigQualities, getBrands } from "@/app/actions/admin-actions";
import PostClient from "./_components/post-client";

export default async function PostsPageServer() {
  const [
    drafts,
    published,
    scheduled,
    currenciesResult,
    userBrandResult,
    qualitiesResult,
    brandsResult,
    postTypesResult,
  ] = await Promise.all([
    getAdminPosts(),
    getPublishedPosts(),
    getScheduledPosts(),
    getCurrencies(),
    getUserBrand(),
    getWigQualities(),
    getBrands(),
    getPostTypes(),
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
          basePrice: Number(post.wig.basePrice) || 0,
          currency: post.wig.currency
            ? {
                id: post.wig.currency.id,
                symbol: post.wig.currency.symbol,
                rate: Number(post.wig.currency.rate) || 0,
              }
            : {
                id: "",
                symbol: "",
                rate: 0,
              },
          quality: post.wig.quality,
        }
      : null,
    brands: post.brands,
    brandIds: post.brands?.map((b) => b.brand.id) || [],
    scheduledFor: post.scheduledFor,
  }));

  // Also convert Decimal objects in currencies array
  const currencies = currenciesResult
    ? currenciesResult.map((currency) => ({
        ...currency,
        rate: Number(currency.rate),
      }))
    : [];

  const initialData = {
    posts: serializedPosts,
    currencies,
    userBrand: userBrandResult || undefined,
    qualities: qualitiesResult || [],
    brands: brandsResult || [],
    postTypes: postTypesResult || [],
  };

  return <PostClient initialData={initialData} />;
}
