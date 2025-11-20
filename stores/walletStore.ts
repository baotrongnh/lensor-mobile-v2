import { create } from 'zustand';
import { walletApi } from '@/lib/api/walletApi';

interface WalletData {
     balance: number;
     currency: string;
     isActive: boolean;
}

interface WalletState {
     balance: number;
     currency: string;
     isActive: boolean;
     loading: boolean;
     fetchBalance: () => Promise<void>;
     updateBalance: (newBalance: number) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
     balance: 0,
     currency: 'USD',
     isActive: true,
     loading: false,

     fetchBalance: async () => {
          set({ loading: true });
          try {
               const response = await walletApi.getWallet();
               const data = response.data;
               set({
                    balance: data.balance,
                    currency: data.currency,
                    isActive: data.isActive,
                    loading: false,
               });
          } catch (error) {
               console.error('Failed to fetch wallet:', error);
               set({ loading: false });
          }
     },

     updateBalance: (newBalance) => {
          set({ balance: newBalance });
     },
}));
