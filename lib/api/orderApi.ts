import { apiClient } from './client';
import { endpoints } from './endpoints';

export type OrderStatus =
     | 'ready_for_withdrawal'
     | 'pending'
     | 'completed'
     | 'failed'
     | 'refunded'
     | 'reported';

export interface OrderItem {
     productId: string;
     productTitle: string;
     quantity: number;
     price: number;
     subtotal: number;
     sellerId: string;
}

export interface Order {
     id: string;
     userId: string;
     totalAmount: string;
     status: OrderStatus;
     paymentMethod: 'wallet' | 'vnpay' | 'credit_card';
     transactionId: string;
     items: OrderItem[];
     canWithdraw: boolean;
     withdrawableAt: string;
     reportId: string | null;
     cancelReason: string | null;
     createdAt: string;
     updatedAt: string;
}

export interface OrdersResponse {
     data: Order[];
}

export interface OrderResponse {
     data: Order;
}

export const orderApi = {
     /**
      * Checkout - Create order from selected cart items
      * @param productIds - Array of product IDs to checkout
      */
     checkout: async (productIds: string[]) => {
          const res = await apiClient.post(endpoints.orders.checkout, { productIds });
          return res.data;
     },

     /**
      * Get all orders
      */
     getAllOrders: async (): Promise<OrdersResponse> => {
          const res = await apiClient.get(endpoints.orders.all);
          return res.data;
     },

     /**
      * Get order by ID
      */
     getOrderById: async (orderId: string): Promise<OrderResponse> => {
          const res = await apiClient.get(endpoints.orders.byId(orderId));
          return res.data;
     },

     /**
      * Get order products
      */
     getOrderProducts: async (orderId: string) => {
          const res = await apiClient.get(endpoints.orders.products(orderId));
          return res.data;
     },
};
