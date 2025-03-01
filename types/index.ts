import { Post } from "@prisma/client";

export type PostWithRelations = Post & {
  brand: {
    name: string;
  };
  wig?: {
    id: string;
    name: string;
    description: string | null;
    basePrice: number;  // Use number since this is likely what Prisma uses
    currencyId: string;
    color: {
      name: string;
      hexCode: string | null;
    };
    size: {
      name: string;
      description: string | null;
    };
    currency: {
      symbol: string;
      rate: string;
      name: string;
    };
    imageUrls: string[];
  } | null;
}; 