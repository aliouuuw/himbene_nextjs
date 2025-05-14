import { format } from "date-fns";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PostWithRelations, Currency } from "@/types";
import {
  EmailShareButton,
  FacebookShareButton,
  LinkedinShareButton,
  PinterestIcon,
  PinterestShareButton,
  RedditShareButton,
  TelegramShareButton,
  TumblrShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  RedditIcon,
  TelegramIcon,
  TumblrIcon,
  WhatsappIcon,
  EmailIcon,
  ThreadsShareButton,
  ThreadsIcon,
} from "react-share";
import { Button } from "./ui/button";
import { fr } from "date-fns/locale";
import { CurrencyCode, getCurrencyFlag } from "@/lib/currency-utils";
import { useState } from "react";
import { UserBrand } from "@prisma/client";
import { Expand, Pencil, Trash } from "lucide-react";
import { FullScreenMediaViewer } from "./full-screen-media-viewer";
import Link from "next/link";
import { deletePost } from "@/app/actions/post-actions";
import { toast } from "sonner";
interface PostCardProps {
  post: PostWithRelations;
  currencies?: Currency[];
  variant?: "default" | "compact";
  showActions?: boolean;
  showShareButtons?: boolean;
  onEdit?: (post: PostWithRelations) => void;
  onDelete?: (postId: string) => void;
  userBrand: UserBrand;
  isAdmin?: boolean;
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
  isAdmin = false,
}: PostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [fullScreenMediaIndex, setFullScreenMediaIndex] = useState<
    number | null
  >(null);

  const formatCurrency = (
    amount: number,
    currency: { symbol: string; rate: number; name?: string }
  ) => {
    const convertedAmount = (amount * currency.rate).toFixed(2);
    return `${currency.symbol} ${convertedAmount}`;
  };

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/posts/${post.id}` || "";

  const getAssociatedUserBrand = (post: PostWithRelations) => {
    if (!userBrand?.brandId) return "No associated brand";
    const brand = post.brands?.find((b) => b.brand.id === userBrand.brandId);
    return brand?.brand.name || "No associated brand";
  };

  const handleDelete = async () => {
    const result = await deletePost(post.id);
    if (result.success) {
      toast.success("Post deleted successfully");
    } else {
      toast.error("Failed to delete post");
    }
  };

  return (
    <>
      <Card className="overflow-hidden border-none max-w-2xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-lg font-semibold">
                {post.wig?.name}
              </CardTitle>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/admin/posts/${post.id}/edit`}>
                    <Pencil className="h-4 w-4 mr-1" />
                    Modifier
                  </Link>
                </Button>

                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  <Trash className="h-4 w-4 mr-1" />
                  Supprimer
                </Button>
              </div>
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
                      className={`group relative aspect-square flex-shrink-0 rounded-md overflow-hidden snap-center transition-all duration-300 w-[200px] cursor-pointer`}
                      onClick={() => setFullScreenMediaIndex(index)}
                    >
                      <Image
                        src={url}
                        alt={`${post.wig?.name || "Product"} image ${
                          index + 1
                        }`}
                        fill
                        sizes="100%"
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute top-2 right-2 bg-background/80 rounded-sm p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Expand className="h-4 w-4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Wig Details */}
          {post.wig && (
            <div className="space-y-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    {/* Post Type & Brand Section */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {post.type?.name && (
                        <Badge variant="secondary" className="text-xs">
                          {post.type.name}
                        </Badge>
                      )}
                      {post.brands && post.brands.length > 0 && (
                        <>
                          {!isAdmin ? (
                            <Badge variant="outline" className="text-xs">
                              {getAssociatedUserBrand(post)}
                            </Badge>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {post.brands.map((brand) => (
                                <Badge
                                  variant="outline"
                                  className="text-xs"
                                  key={brand.brand.id}
                                >
                                  {brand.brand.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Specifications Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {post.wig.size?.name && (
                        <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-md">
                          <span className="text-xs text-muted-foreground">
                            Taille:
                          </span>
                          <span className="text-xs font-medium">
                            {post.wig.size.name}
                          </span>
                        </div>
                      )}
                      {post.wig.color?.name && (
                        <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-md">
                          <span className="text-xs text-muted-foreground">
                            Couleur:
                          </span>
                          <span className="text-xs font-medium">
                            {post.wig.color.name}
                          </span>
                        </div>
                      )}
                      {post.wig.quality?.name && (
                        <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-md">
                          <span className="text-xs text-muted-foreground">
                            Qualité:
                          </span>
                          <span className="text-xs font-medium">
                            {post.wig.quality.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                    {format(new Date(post.createdAt), "d MMMM yyyy", {
                      locale: fr,
                    })}
                  </p>
                </div>

                {/* Description with smooth transition */}
                {post.wig.description && (
                  <div className="space-y-2">
                    <div
                      className={`relative ${
                        !isExpanded && "max-h-[48px] overflow-hidden"
                      }`}
                    >
                      <p className="text-sm text-muted-foreground italic">
                        {post.wig.description}
                      </p>
                      {!isExpanded && post.wig.description.length > 100 && (
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent" />
                      )}
                    </div>
                    {post.wig.description.length > 100 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-auto py-1 px-2"
                        onClick={() => setIsExpanded(!isExpanded)}
                      >
                        {isExpanded ? "Voir moins ↑" : "Voir plus ↓"}
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Pricing */}
              <div className="bg-muted/50 p-4 rounded-md">
                <h4 className="text-sm font-medium mb-3">Prix disponibles</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* Local Price - Always First */}
                  <div className="flex items-center justify-between p-3 rounded-md">
                    <div className="flex items-center gap-2">
                      {post.wig.currency?.id && (
                        <Image
                          src={getCurrencyFlag(
                            post.wig.currency.id as CurrencyCode
                          )}
                          alt={post.wig.currency.id}
                          width={24}
                          height={18}
                          className="rounded-sm"
                        />
                      )}
                      {/* <span className="text-sm text-muted-foreground">
                        {getCurrencyName(post.wig.currency.id as CurrencyCode)}
                      </span> */}
                    </div>
                    <span className="text-base font-semibold">
                      {formatCurrency(Number(post.wig.basePrice), {
                        symbol: post.wig.currency?.symbol,
                        rate: Number(post.wig.currency?.rate),
                      })}
                    </span>
                  </div>

                  {/* Other Currencies */}
                  {variant === "default" &&
                    currencies
                      .filter((curr) => curr.id !== post.wig?.currencyId)
                      .map((currency) => (
                        <div
                          key={currency.id}
                          className="flex items-center justify-between bg-muted/30 p-3 rounded-md hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Image
                              src={getCurrencyFlag(currency.id as CurrencyCode)}
                              alt={currency.id}
                              width={24}
                              height={18}
                              className="rounded-sm"
                            />
                            {/* <span className="text-sm text-muted-foreground">
                            {currency.name}
                          </span> */}
                          </div>
                          <span className="text-base font-medium">
                            {formatCurrency(Number(post.wig?.basePrice || 0), {
                              symbol: currency.symbol,
                              rate: Number(currency.rate),
                            })}
                          </span>
                        </div>
                      ))}
                </div>
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
                  <WhatsappShareButton url={shareUrl}>
                    <WhatsappIcon size={32} round />
                  </WhatsappShareButton>
                  <LinkedinShareButton url={shareUrl}>
                    <LinkedinIcon size={32} round />
                  </LinkedinShareButton>
                  <ThreadsShareButton url={shareUrl}>
                    <ThreadsIcon size={32} round />
                  </ThreadsShareButton>
                  <RedditShareButton url={shareUrl}>
                    <RedditIcon size={32} round />
                  </RedditShareButton>
                  <TelegramShareButton url={shareUrl}>
                    <TelegramIcon size={32} round />
                  </TelegramShareButton>
                  <PinterestShareButton
                    url={shareUrl}
                    media={(post.mediaUrls as string[])?.[0] || ""}
                  >
                    <PinterestIcon size={32} round />
                  </PinterestShareButton>
                  <TumblrShareButton url={shareUrl}>
                    <TumblrIcon size={32} round />
                  </TumblrShareButton>
                  <EmailShareButton url={shareUrl}>
                    <EmailIcon size={32} round />
                  </EmailShareButton>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {fullScreenMediaIndex !== null && post.mediaUrls && (
        <FullScreenMediaViewer
          mediaUrls={post.mediaUrls as string[]}
          initialIndex={fullScreenMediaIndex}
          onClose={() => setFullScreenMediaIndex(null)}
          wigName={post.wig?.name}
        />
      )}
    </>
  );
}
