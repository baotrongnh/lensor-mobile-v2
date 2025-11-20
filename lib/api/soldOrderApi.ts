import { apiClient } from './client';
import { endpoints } from './endpoints';
import { SoldOrder, SoldOrdersResponse } from '@/types/soldOrder';

export const soldOrderApi = {
     /**
      * Get sold orders for authenticated user
      */
     getSoldOrders: async (): Promise<SoldOrder[]> => {
          const response = await apiClient.get<SoldOrdersResponse>(endpoints.orders.sold);
          return response.data.data;
     },

     /**
      * Get a single sold order by ID
      */
     getSoldOrderById: async (id: string): Promise<SoldOrder> => {
          const response = await apiClient.get<{ data: SoldOrder }>(endpoints.orders.byId(id));
          return response.data.data;
     },
};
