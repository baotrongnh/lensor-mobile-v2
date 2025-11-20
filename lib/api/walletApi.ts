/**
 * Wallet API - Simple & Clean
 * Lấy thông tin ví và lịch sử giao dịch
 */

import { apiClient } from './client';
import { endpoints } from './endpoints';

export const walletApi = {
     // Lấy thông tin wallet
     getWallet: async () => {
          const res = await apiClient.get(endpoints.wallet);
          return res.data;
     },

     // Lấy lịch sử giao dịch
     getPaymentHistory: async (page: number = 1, limit: number = 20) => {
          const res = await apiClient.get(`${endpoints.paymentHistory}?page=${page}&limit=${limit}`);
          return res.data;
     },
};

export const paymentApi = {
     // Tạo thanh toán PayPal
     createPaypal: async (amount: number, orderInfo: string) => {
          const res = await apiClient.post(endpoints.payment.paypal, { amount, orderInfo });
          return res.data;
     },

     // Tạo thanh toán VNPay
     createVnpay: async (amount: number, orderInfo: string) => {
          const res = await apiClient.post(endpoints.payment.vnpay, { amount, orderInfo });
          return res.data;
     },
};
