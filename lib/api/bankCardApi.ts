import { apiClient } from './client';
import {
     BankCard,
     BankCardsResponse,
     BankCardResponse,
     CreateBankCardPayload,
     UpdateBankCardPayload,
} from '@/types/bankCard';

export const bankCardApi = {
     async getBankCards(): Promise<BankCard[]> {
          const res = await apiClient.get<BankCardsResponse>('/bank-cards');
          return res.data.data;
     },

     async getBankCardById(id: string): Promise<BankCard> {
          const res = await apiClient.get<BankCardResponse>(`/bank-cards/${id}`);
          return res.data.data;
     },

     async createBankCard(payload: CreateBankCardPayload): Promise<BankCard> {
          const res = await apiClient.post<BankCardResponse>('/bank-cards', payload);
          return res.data.data;
     },

     async updateBankCard(id: string, payload: UpdateBankCardPayload): Promise<BankCard> {
          const res = await apiClient.put<BankCardResponse>(`/bank-cards/${id}`, payload);
          return res.data.data;
     },

     async deleteBankCard(id: string): Promise<void> {
          await apiClient.delete(`/bank-cards/${id}`);
     },

     async setDefaultCard(id: string): Promise<BankCard> {
          const res = await apiClient.patch<BankCardResponse>(`/bank-cards/${id}/set-default`);
          return res.data.data;
     },
};
