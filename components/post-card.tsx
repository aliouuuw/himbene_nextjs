import { format } from "date-fns";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PostWithRelations, Currency } from "@/types";
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  PinterestShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  PinterestIcon,
} from "next-share";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import { fr } from "date-fns/locale";
import { CurrencyCode, getCurrencyFlag } from "@/lib/currency-utils";
import { useState } from "react";
import { UserBrand } from "@prisma/client";
import { Expand, Minimize2 } from "lucide-react";

interface PostCardProps {
  post: PostWithRelations;
  currencies?: Currency[];
  variant?: "default" | "compact";
  showActions?: boolean;
  showShareButtons?: boolean;
  onEdit?: (post: PostWithRelations) => void;
  onDelete?: (postId: string) => void;
  userBrand: UserBrand;
  isInfographic?: boolean;
}

export function PostCard({
  post,
  currencies = [],
  variant = "default",
  showActions = false,
  showShareButtons = true,
  onEdit,
  onDelete,
  userBrand,
  isInfographic = false,
}: PostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedImageIndex, setExpandedImageIndex] = useState<number | null>(null);

  const formatCurrency = (
    amount: number,
    currency: { symbol: string; rate: number; name?: string }
  ) => {
    const convertedAmount = (amount * currency.rate).toFixed(2);
    return `${currency.symbol} ${convertedAmount}`;
  };

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/posts/${post.id}` || "";

  const pathname = usePathname();
  const isDashboardOrCommercial = pathname.includes("/dashboard/admin") || pathname.includes("/dashboard/commercial");
  //console.log(post);

  const getAssociatedUserBrand = (post: PostWithRelations) => {
    if (!userBrand?.brandId) return 'No associated brand';
    const brand = post.brands?.find(b => b.brand.id === userBrand.brandId);
    return brand?.brand.name || 'No associated brand';
  };

  return (
    <Card className="overflow-hidden border-none max-w-2xl">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="text-lg font-semibold">
              {post.wig?.name}
            </CardTitle>
          </div>
          {isDashboardOrCommercial && (
            <Badge variant="outline" className="text-xs">
              {post.status}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Media Gallery */}
        {post.mediaUrls &&
          Array.isArray(post.mediaUrls) &&
          post.mediaUrls.length > 0 && (
            <div className="bg-muted/50 rounded-md p-2">
              <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
                {(post.mediaUrls as string[]).map((url, index) => (
                  <div
                    key={index}
                    className={`group relative aspect-square flex-shrink-0 rounded-md overflow-hidden snap-center transition-all duration-300 cursor-pointer ${
                      expandedImageIndex === index 
                        ? 'w-full max-w-none z-10' 
                        : expandedImageIndex !== null 
                          ? 'w-[100px]' 
                          : 'w-[200px]'
                    }`}
                    onClick={() => setExpandedImageIndex(expandedImageIndex === index ? null : index)}
                  >
                    <Image
                      src={url}
                      alt={`${post.wig?.name || "Product"} image ${index + 1}`}
                      fill
                      sizes="100%"
                      className={`transition-transform group-hover:scale-105 ${
                        expandedImageIndex === index 
                          ? 'w-full max-w-none object-contain' 
                          : expandedImageIndex !== null 
                            ? 'w-[100px] object-cover' 
                            : 'w-[200px] object-cover'
                      }`}
                    />
                    <div className="absolute top-2 right-2 bg-background/80 rounded-sm p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {expandedImageIndex === index ? <Minimize2 className="h-4 w-4" />  : <Expand className="h-4 w-4" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Wig Details */}
        {post.wig && (
          <div className="space-y-4">
            <div className="flex items-start justify-between pb-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                    {post.brands && post.brands.length > 0 && (
                      <>
                        {!isInfographic && (
                          <Badge variant="secondary" className="text-xs">
                            {getAssociatedUserBrand(post)}
                          </Badge>
                        )}
                        {isInfographic && post.brands.map((brand) => (
                          <Badge variant="secondary" className="text-xs" key={brand.brand.id}>
                            {brand.brand.name}
                          </Badge>
                        ))}                 
                      </>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {post.wig.size?.name}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {post.wig.color?.name}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {post.wig.quality?.name}
                    </Badge>
                  </div>
                {post.wig.description && (
                  <div className="space-y-2">
                    <p className={`text-sm text-muted-foreground italic pt-4 ${!isExpanded && 'line-clamp-2'}`}>
                      {post.wig.description}
                    </p>
                    {post.wig.description.length > 100 && (
                      <Button
                        variant="link"
                        className="p-0 h-auto text-xs"
                        onClick={() => setIsExpanded(!isExpanded)}
                      >
                        {isExpanded ? 'Voir moins' : 'Voir plus'}
                      </Button>
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {format(new Date(post.createdAt), "d MMMM yyyy", { locale: fr })}
              </p>
            </div>

            {/* Pricing */}
            <div className="bg-muted/50 p-3 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Prix local</span>
                <span className="text-lg font-semibold flex items-center gap-2">
                  {post.wig.currency?.id && (
                    <Image 
                      src={getCurrencyFlag(post.wig.currency.id as CurrencyCode)} 
                      alt={post.wig.currency.id}
                      width={20}
                      height={15}
                      className="rounded-sm"
                    />
                  )}
                  {formatCurrency(Number(post.wig.basePrice), {
                    symbol: post.wig.currency?.symbol,
                    rate: Number(post.wig.currency?.rate),
                  })}
                </span>
              </div>

              {variant === "default" && currencies.length > 0 && (
                <div className="text-sm space-y-2 pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-1">
                    Disponible dans d&apos;autres devises:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {currencies
                      .filter((curr) => curr.id !== post.wig?.currencyId)
                      .map((currency) => (
                        <div
                          key={currency.id}
                          className="flex items-center justify-between bg-background/50 p-2 rounded"
                        >
                          <span className="text-muted-foreground flex items-center gap-2">
                            <Image 
                              src={getCurrencyFlag(currency.id as CurrencyCode)} 
                              alt={currency.id}
                              width={20}
                              height={15}
                              className="rounded-sm"
                            />
                            {currency.name}
                          </span>
                          <span className="font-medium">
                            {formatCurrency(Number(post.wig?.basePrice || 0), {
                              symbol: currency.symbol,
                              rate: Number(currency.rate),
                            })}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {showActions ? (
            <>
              {onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(post)}
                >
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDelete(post.id)}
                >
                  Delete
                </Button>
              )}
            </>
          ) : !showShareButtons ? (
            <></>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium">Partager:</p>
              <div className="flex gap-2">
                <FacebookShareButton url={shareUrl}>
                  <FacebookIcon size={32} round />
                </FacebookShareButton>
                <TwitterShareButton url={shareUrl}>
                  <TwitterIcon size={32} round />
                </TwitterShareButton>
                <LinkedinShareButton url={shareUrl}>
                  <LinkedinIcon size={32} round />
                </LinkedinShareButton>
                <PinterestShareButton
                  url={shareUrl}
                  media={(post.mediaUrls as string[])?.[0] || ""}
                >
                  <PinterestIcon size={32} round />
                </PinterestShareButton>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
