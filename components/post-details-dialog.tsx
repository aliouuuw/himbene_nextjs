import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PostWithRelations, Currency } from "@/types";
import { PostCard } from "@/components/post-card";
interface PostDetailsDialogProps {
  post: PostWithRelations;
  currencies: Currency[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showShareButtons?: boolean;
  isAdmin?: boolean;
}

export function PostDetailsDialog({ post, currencies, open, onOpenChange, showShareButtons, isAdmin }: PostDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-scroll">
        <DialogHeader>
          <DialogTitle>Post commercial</DialogTitle>
        </DialogHeader>
        
        <PostCard post={post} currencies={currencies} variant="default" showActions={false} showShareButtons={showShareButtons} isAdmin={isAdmin} />
      </DialogContent>
    </Dialog>
  );
} 