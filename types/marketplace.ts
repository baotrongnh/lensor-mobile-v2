/**
 * Marketplace Types
 * Giống y hệt types của web version
 */

export type ImagePair = {
     before: string;
     after: string;
};

export type PresetFile = {
     url: string;
     fileName: string;
     fileSize?: number;
     format: string;
};

export type MarketplaceItem = {
     id: string;
     title: string;
     description: string;
     price: number;
     salePrice?: number;
     image?: string;
     imagePairs?: ImagePair[];
     thumbnail: string;
     author: {
          name: string;
          avatar: string;
     };
     presetFile?: PresetFile;
     rating?: number;
     category: string;
};

export type MarketplaceDetail = {
     id: string;
     name: string;
     description: string;
     price: number;
     originalPrice?: number;
     discount?: number;
     rating?: number;
     reviewCount?: number;
     downloads?: number;
     userId?: string; // Author's user ID for contact
     author: {
          id?: string; // Author's user ID
          name: string;
          avatar: string;
          verified?: boolean;
          totalProducts?: number;
     };
     imagePairs?: ImagePair[];
     category: string;
     tags?: string[];
     compatibility?: string[];
     fileFormat?: string;
     fileSize?: string;
     includesCount?: number;
     features?: string[];
     specifications?: {
          adjustments?: string[];
          bestFor?: string[];
          difficulty?: string;
     };
     createdAt?: string;
     updatedAt?: string;
     warranty?: {
          duration?: string;
          coverage?: string;
          terms?: string[];
     };
     reviews?: Review[];
};

export type Review = {
     id: string;
     userId: string;
     userName: string;
     userAvatar?: string;
     rating: number;
     comment: string;
     createdAt: string;
     helpful?: number;
};

export type CreateReviewPayload = {
     rating: number;
     comment: string;
};
