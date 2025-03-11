export type PostWithRelations = {
  id: string;
  content: string;
  status: string;
  mediaUrls: string[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  brandIds: string[];
  brands: {
    brand: {
      id: string;
      name: string;
    };
  }[];
  user: {
    name: string | null;
  };
  wig?: {
    id: string;
    name: string;
    description: string | null;
    basePrice: number;
    currencyId: string;
    currency: {
      id: string;
      symbol: string;
      rate: number;
    };
    color: {
      name: string;
    };
    size: {
      name: string;
    };
    quality: {
      id: string;
      name: string;
      orderIndex: number;
    };
  } | null;
  sharedBy: { userId: string }[];
  isShared: boolean;
  scheduledFor: Date | null;
}; 

export type Currency = {
  id: string;
  symbol: string;
  name: string;
  rate: number;
  isBase: boolean;
  lastUpdated: Date;
};
