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
interface PostCardProps {
  post: PostWithRelations;
  currencies?: Currency[];
  variant?: "default" | "compact";
  showActions?: boolean;
  showShareButtons?: boolean;
  onEdit?: (post: PostWithRelations) => void;
  onDelete?: (postId: string) => void;
}

export function PostCard({
  post,
  currencies = [],
  variant = "default",
  showActions = false,
  showShareButtons = true,
  onEdit,
  onDelete,
}: PostCardProps) {

  const formatCurrency = (
    amount: number,
    currency: { symbol: string; rate: number; name?: string }
  ) => {
    const convertedAmount = (amount * currency.rate).toFixed(2);
    return `${currency.symbol} ${convertedAmount}`;
  };

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/posts/${post.id}` || "";

  const pathname = usePathname();
  const isDashboard = pathname.includes("/dashboard");

  return (
    <Card className="overflow-hidden border-none max-w-2xl">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="text-lg font-semibold">
              {post.wig?.name}
            </CardTitle>
          </div>
          {!isDashboard && (
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
            <div
              className={`grid ${
                post.mediaUrls.length > 1 ? "grid-cols-2" : "grid-cols-1"
              } gap-2 bg-muted/50 rounded-md`}
            >
              {(post.mediaUrls as string[]).slice(0, 2).map((url, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-md overflow-hidden"
                >
                  <Image
                    src={url}
                    alt={`${post.wig?.name || "Product"} image ${index + 1}`}
                    fill
                    className="object-cover transition-transform hover:scale-105"
                  />
                </div>
              ))}
            </div>
          )}

        {/* Wig Details */}
        {post.wig && (
          <div className="space-y-4">
            <div className="flex items-start justify-between pb-2">
              <div className="space-y-1">
                {post.wig && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {post.brand.name}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {post.wig.size?.name}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {post.wig.color?.name}
                    </Badge>
                  </div>
                )}
                {post.wig.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 italic pt-4">
                    {post.wig.description}
                  </p>
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
                <span className="text-lg font-semibold">
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
                          <span className="text-muted-foreground">
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
          ) : showShareButtons ? (
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
