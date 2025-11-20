import { apiClient } from './client';
import { PurchasedOrder, PurchasedOrdersResponse, PurchasedOrderResponse } from '@/types/purchasedOrder';

export const purchasedOrderApi = {
     async getPurchasedOrders(): Promise<PurchasedOrder[]> {
          const res = await apiClient.get<PurchasedOrdersResponse>('/orders');
          return res.data.data;
     },

     async getPurchasedOrderById(orderId: string): Promise<PurchasedOrder> {
          const res = await apiClient.get<PurchasedOrderResponse>(`/orders/${orderId}`);
          return res.data.data;
     },

     async downloadProduct(orderId: string, productId: string): Promise<any> {
          const res = await apiClient.get(`/orders/${orderId}/products/${productId}/download`, {
               responseType: 'blob',
          });
          return res.data;
     },
};
