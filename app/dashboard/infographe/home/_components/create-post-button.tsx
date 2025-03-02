"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { CreatePostDialog } from "../../_components/create-post-dialog";
import { Currency } from "@/types";
import { Brand, WigColor, WigSize } from "@prisma/client";
export function CreatePostButton({ currencies, brands, colors, sizes }: { currencies: Currency[], brands: Brand[], colors: WigColor[], sizes: WigSize[] }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Post
            </Button>
            <CreatePostDialog 
                open={open} 
                onOpenChange={setOpen}
                currencies={currencies}
                brands={brands}
                colors={colors}
                sizes={sizes}
            />
        </>
    );
} 