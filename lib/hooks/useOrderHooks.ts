/**
 * Sold Order & Withdrawal Hooks
 * Custom hooks for sold orders, withdrawals, and bank cards
 */

import { useState, useEffect, useCallback } from 'react';
import { soldOrderApi } from '../api/soldOrderApi';
import { bankCardApi, withdrawalApi } from '../api/withdrawalApi';
import { purchasedOrderApi } from '../api/purchasedOrderApi';
import { SoldOrder } from '@/types/soldOrder';
import { BankCard, Withdrawal, CreateBankCardPayload, CreateWithdrawalPayload } from '@/types/withdrawal';
import { PurchasedOrder } from '@/types/purchasedOrder';

/**
 * Hook to get sold orders
 */
export const useSoldOrders = () => {
     const [data, setData] = useState<SoldOrder[] | null>(null);
     const [error, setError] = useState<Error | null>(null);
     const [isLoading, setIsLoading] = useState(true);
     const [isValidating, setIsValidating] = useState(false);

     const fetchSoldOrders = useCallback(async () => {
          try {
               setIsValidating(true);
               const result = await soldOrderApi.getSoldOrders();
               console.log('Sold orders fetched successfully:', result?.length || 0, 'orders');
               setData(result);
               setError(null);
          } catch (err: any) {
               console.error('Failed to fetch sold orders:', {
                    message: err.message,
                    status: err.response?.status,
                    data: err.response?.data,
                    url: err.config?.url,
               });
               setError(err as Error);
          } finally {
               setIsLoading(false);
               setIsValidating(false);
          }
     }, []);

     useEffect(() => {
          fetchSoldOrders();
     }, [fetchSoldOrders]);

     const mutate = useCallback(() => {
          fetchSoldOrders();
     }, [fetchSoldOrders]);

     return { data, error, isLoading, mutate, isValidating };
};

/**
 * Hook to get bank cards
 */
export const useBankCards = () => {
     const [data, setData] = useState<BankCard[] | null>(null);
     const [error, setError] = useState<Error | null>(null);
     const [isLoading, setIsLoading] = useState(true);
     const [isValidating, setIsValidating] = useState(false);

     const fetchBankCards = useCallback(async () => {
          try {
               setIsValidating(true);
               const result = await bankCardApi.getBankCards();
               setData(result);
               setError(null);
          } catch (err) {
               setError(err as Error);
          } finally {
               setIsLoading(false);
               setIsValidating(false);
          }
     }, []);

     useEffect(() => {
          fetchBankCards();
     }, [fetchBankCards]);

     const mutate = useCallback(() => {
          fetchBankCards();
     }, [fetchBankCards]);

     return { data, error, isLoading, mutate, isValidating };
};

/**
 * Hook to get withdrawals
 */
export const useWithdrawals = () => {
     const [data, setData] = useState<Withdrawal[] | null>(null);
     const [error, setError] = useState<Error | null>(null);
     const [isLoading, setIsLoading] = useState(true);
     const [isValidating, setIsValidating] = useState(false);

     const fetchWithdrawals = useCallback(async () => {
          try {
               setIsValidating(true);
               const result = await withdrawalApi.getWithdrawals();
               setData(result);
               setError(null);
          } catch (err) {
               setError(err as Error);
          } finally {
               setIsLoading(false);
               setIsValidating(false);
          }
     }, []);

     useEffect(() => {
          fetchWithdrawals();
     }, [fetchWithdrawals]);

     const mutate = useCallback(() => {
          fetchWithdrawals();
     }, [fetchWithdrawals]);

     return { data, error, isLoading, mutate, isValidating };
};

/**
 * Hook to create bank card
 */
export const useCreateBankCard = () => {
     const [isSubmitting, setIsSubmitting] = useState(false);

     const createBankCard = async (payload: CreateBankCardPayload): Promise<BankCard> => {
          setIsSubmitting(true);
          try {
               const result = await bankCardApi.createBankCard(payload);
               return result;
          } finally {
               setIsSubmitting(false);
          }
     };

     return { createBankCard, isSubmitting };
};

/**
 * Hook to delete bank card
 */
export const useDeleteBankCard = () => {
     const [isDeleting, setIsDeleting] = useState(false);

     const deleteBankCard = async (id: string): Promise<void> => {
          setIsDeleting(true);
          try {
               await bankCardApi.deleteBankCard(id);
          } finally {
               setIsDeleting(false);
          }
     };

     return { deleteBankCard, isDeleting };
};

/**
 * Hook to create withdrawal
 */
export const useCreateWithdrawal = () => {
     const [isSubmitting, setIsSubmitting] = useState(false);

     const createWithdrawal = async (payload: CreateWithdrawalPayload): Promise<Withdrawal> => {
          setIsSubmitting(true);
          try {
               const result = await withdrawalApi.createWithdrawal(payload);
               return result;
          } finally {
               setIsSubmitting(false);
          }
     };

     return { createWithdrawal, isSubmitting };
};

/**
 * Hook to get purchased orders
 */
export const usePurchasedOrders = () => {
     const [data, setData] = useState<PurchasedOrder[] | null>(null);
     const [error, setError] = useState<Error | null>(null);
     const [isLoading, setIsLoading] = useState(true);
     const [isValidating, setIsValidating] = useState(false);

     const fetchPurchasedOrders = useCallback(async () => {
          try {
               setIsValidating(true);
               const result = await purchasedOrderApi.getPurchasedOrders();
               setData(result);
               setError(null);
          } catch (err) {
               setError(err as Error);
          } finally {
               setIsLoading(false);
               setIsValidating(false);
          }
     }, []);

     useEffect(() => {
          fetchPurchasedOrders();
     }, [fetchPurchasedOrders]);

     const mutate = useCallback(() => {
          fetchPurchasedOrders();
     }, [fetchPurchasedOrders]);

     return { data, error, isLoading, mutate, isValidating };
};
