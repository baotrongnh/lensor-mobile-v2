import { create } from 'zustand';
import { cartApi, CartItemData } from '@/lib/api/cartApi';

interface CartStore {
     items: CartItemData[];
     total: number;
     count: number;
     loading: boolean;
     error: string | null;

     // Actions
     fetchCart: () => Promise<void>;
     addToCart: (productId: string, quantity: number) => Promise<void>;
     updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
     removeItem: (cartItemId: string) => Promise<void>;
     clearCart: () => Promise<void>;
}

export const useCartStore = create<CartStore>((set, get) => ({
     items: [],
     total: 0,
     count: 0,
     loading: false,
     error: null,

     fetchCart: async () => {
          set({ loading: true, error: null });
          try {
               const data = await cartApi.getAll();
               set({
                    items: data.items,
                    total: data.total,
                    count: data.count,
                    loading: false,
               });
          } catch (error: any) {
               set({
                    error: error.message || 'Failed to fetch cart',
                    loading: false,
               });
          }
     },

     addToCart: async (productId: string, quantity: number) => {
          set({ loading: true, error: null });
          try {
               await cartApi.addItem({ productId, quantity });
               await get().fetchCart(); // Refresh cart after adding
          } catch (error: any) {
               set({
                    error: error.message || 'Failed to add item to cart',
                    loading: false,
               });
               throw error;
          }
     },

     updateQuantity: async (cartItemId: string, quantity: number) => {
          set({ loading: true, error: null });
          try {
               await cartApi.updateCartItem(cartItemId, quantity);
               await get().fetchCart(); // Refresh cart after updating
          } catch (error: any) {
               set({
                    error: error.message || 'Failed to update item',
                    loading: false,
               });
               throw error;
          }
     },

     removeItem: async (cartItemId: string) => {
          set({ loading: true, error: null });
          try {
               await cartApi.removeCartItem(cartItemId);
               await get().fetchCart(); // Refresh cart after removing
          } catch (error: any) {
               set({
                    error: error.message || 'Failed to remove item',
                    loading: false,
               });
               throw error;
          }
     },

     clearCart: async () => {
          set({ loading: true, error: null });
          try {
               await cartApi.clearCart();
               set({
                    items: [],
                    total: 0,
                    count: 0,
                    loading: false,
               });
          } catch (error: any) {
               set({
                    error: error.message || 'Failed to clear cart',
                    loading: false,
               });
               throw error;
          }
     },
}));
