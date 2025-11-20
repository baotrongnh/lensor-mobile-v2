import { apiClient } from './client';
import { endpoints } from './endpoints';

export interface CartItemData {
     id: string;
     quantity: number;
     price: string;
     product?: {
          id: string;
          title: string;
          thumbnail: string;
          price: string;
          originalPrice?: string;
          category?: string;
          status?: 'active' | 'inactive' | 'blocked';
          userId?: string;
          owner?: {
               id: string;
               name: string;
          };
     };
}

export interface CartResponse {
     items: CartItemData[];
     total: number;
     count: number;
}

export const cartApi = {
     /**
      * Get all cart items
      */
     getAll: async (): Promise<CartResponse> => {
          const res = await apiClient.get(endpoints.cart.all);
          return res.data.data;
     },

     /**
      * Add item to cart
      */
     addItem: async (payload: { productId: string; quantity: number }) => {
          const res = await apiClient.post(`${endpoints.cart.all}/add`, payload, {
               headers: {
                    'Content-Type': 'application/json',
               },
          });
          return res.data;
     },

     /**
      * Update cart item quantity
      */
     updateCartItem: async (cartItemId: string, quantity: number) => {
          const res = await apiClient.patch(
               `${endpoints.cart.all}/update/${cartItemId}`,
               { quantity },
               {
                    headers: {
                         'Content-Type': 'application/json',
                    },
               }
          );
          return res.data;
     },

     /**
      * Remove item from cart
      */
     removeCartItem: async (cartItemId: string) => {
          const res = await apiClient.delete(`${endpoints.cart.all}/remove/${cartItemId}`);
          return res.data;
     },

     /**
      * Clear entire cart
      */
     clearCart: async () => {
          const res = await apiClient.delete(`${endpoints.cart.all}/clear`);
          return res.data;
     },
};
