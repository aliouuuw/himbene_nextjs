import { Post } from "@prisma/client";

export type PostWithRelations = Post & {
  user: {
    firstName: string | null;
    lastName: string | null;
  };
  brand: {
    name: string;
  };
  wig?: {
    id: string;
    name: string;
    description: string | null;
    basePrice: number;
    currencyId: string;
    color: {
      name: string;
    };
    size: {
      name: string;
    };
    currency: {
      id: string;
      symbol: string;
      rate: number;
    };
  } | null;
  sharedBy?: {
    userId: string;
    sharedAt: Date;
  }[];
  isShared?: boolean;
}; 

export type Currency = {
  id: string;
  symbol: string;
  name: string;
  rate: number;
  isBase: boolean;
  lastUpdated: Date;
};
