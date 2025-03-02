export type PostWithRelations = {
  id: string;
  content: string;
  status: string;
  mediaUrls: string[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  brandId: string;
  brand: {
    name: string;
  };
  user: {
    firstName: string | null;
    lastName: string | null;
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
