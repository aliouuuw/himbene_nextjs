"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreatePostForm } from "./CreatePostForm";
import { Currency, } from "@/types";
import { Brand, WigColor, WigSize, WigQuality } from "@prisma/client";

interface CreatePostDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currencies: Currency[];
    brands: Brand[];
    colors: WigColor[];
    sizes: WigSize[];
    qualities: WigQuality[];
}

export function CreatePostDialog({ open, onOpenChange, currencies, brands, colors, sizes, qualities }: CreatePostDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Créer un nouveau post</DialogTitle>
                </DialogHeader>
                <CreatePostForm 
                    brands={brands}
                    colors={colors}
                    sizes={sizes}
                    currencies={currencies}
                    qualities={qualities}
                />
            </DialogContent>
        </Dialog>
    );
} 