/**
 * Marketplace API
 * API calls cho marketplace - giống web version
 */

import { apiClient } from './client';
import { endpoints } from './endpoints';

export const marketplaceApi = {
     /**
      * Get tất cả marketplace items
      */
     getAll: async () => {
          const res = await apiClient.get(endpoints.marketplace.all);
          return res.data;
     },

     /**
      * Get marketplace item theo id
      */
     getById: async (id: string) => {
          const res = await apiClient.get(endpoints.product.byId(id));
          return res.data;
     },

     /**
      * Get own products
      */
     getOwn: async () => {
          const res = await apiClient.get(endpoints.product.all + '/me');
          return res.data;
     },

     /**
      * Create review cho product
      */
     createReview: async (productId: string, payload: { rating: number; comment: string }) => {
          const res = await apiClient.post(endpoints.review.byProductId(productId), payload);
          return res.data;
     },
};
