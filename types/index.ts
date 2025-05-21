export type PostWithRelations = {
  id: string;
  content: string;
  status: string;
  mediaUrls: string[];
  mediaNames: string[];
  typeId: string;
  type: {
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
  userId: string;
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
      id: string;
      name: string;
    };
    size: {
      id: string;
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
