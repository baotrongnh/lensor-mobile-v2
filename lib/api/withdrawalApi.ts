import { apiClient } from './client';
import { endpoints } from './endpoints';
import {
     BankCard,
     BankCardsResponse,
     CreateBankCardPayload,
     CreateWithdrawalPayload,
     Withdrawal,
     WithdrawalResponse,
     WithdrawalStatistics,
} from '@/types/withdrawal';

export const bankCardApi = {
     /**
      * Get all bank cards for authenticated user
      */
     getBankCards: async (): Promise<BankCard[]> => {
          const response = await apiClient.get<BankCardsResponse>(endpoints.bankCard.all);
          return response.data.data;
     },

     /**
      * Create a new bank card
      */
     createBankCard: async (payload: CreateBankCardPayload): Promise<BankCard> => {
          const response = await apiClient.post<{ data: BankCard }>(endpoints.bankCard.create, payload);
          return response.data.data;
     },

     /**
      * Update a bank card
      */
     updateBankCard: async (id: string, payload: Partial<CreateBankCardPayload>): Promise<BankCard> => {
          const response = await apiClient.put<{ data: BankCard }>(endpoints.bankCard.byId(id), payload);
          return response.data.data;
     },

     /**
      * Delete a bank card
      */
     deleteBankCard: async (id: string): Promise<void> => {
          await apiClient.delete(endpoints.bankCard.byId(id));
     },

     /**
      * Set a bank card as default
      */
     setDefaultBankCard: async (id: string): Promise<BankCard> => {
          const response = await apiClient.put<{ data: BankCard }>(endpoints.bankCard.setDefault(id));
          return response.data.data;
     },
};

export const withdrawalApi = {
     /**
      * Create a new withdrawal request
      */
     createWithdrawal: async (payload: CreateWithdrawalPayload): Promise<Withdrawal> => {
          const response = await apiClient.post<WithdrawalResponse>(endpoints.withdrawal.create, payload);
          return response.data.data;
     },

     /**
      * Get all withdrawals for authenticated user
      */
     getWithdrawals: async (): Promise<Withdrawal[]> => {
          const response = await apiClient.get<{ data: Withdrawal[] }>(endpoints.withdrawal.all);
          return response.data.data;
     },

     /**
      * Get a single withdrawal by ID
      */
     getWithdrawalById: async (id: string): Promise<Withdrawal> => {
          const response = await apiClient.get<{ data: Withdrawal }>(endpoints.withdrawal.byId(id));
          return response.data.data;
     },

     /**
      * Get withdrawal statistics
      */
     getStatistics: async (): Promise<WithdrawalStatistics> => {
          const response = await apiClient.get<{ data: WithdrawalStatistics }>(endpoints.withdrawal.statistics);
          return response.data.data;
     },
};
