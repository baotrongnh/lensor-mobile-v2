import { apiClient } from './client';
import { endpoints } from './endpoints';

export const paymentApi = {
     /**
      * Create PayPal payment
      * @param amount - Amount in VND
      * @param orderInfo - Order description
      * @param isMobile - Whether this is a mobile payment (affects returnUrl)
      * @param returnUrl - Custom return URL for mobile deep linking (optional)
      */
     createPaypal: async (amount: number, orderInfo: string, isMobile: boolean = false, returnUrl?: string) => {
          const res = await apiClient.post(endpoints.payment.paypal, {
               amount,
               orderInfo,
               isMobile,
               returnUrl,
          });
          return res.data;
     },

     /**
      * Create VNPay payment
      * @param amount - Amount in VND
      * @param orderInfo - Order description
      * @param isMobile - Whether this is a mobile payment (affects returnUrl)
      * @param returnUrl - Custom return URL for mobile deep linking (optional)
      */
     createVnpay: async (amount: number, orderInfo: string, isMobile: boolean = false, returnUrl?: string) => {
          const res = await apiClient.post(endpoints.payment.vnpay, {
               amount,
               orderInfo,
               isMobile,
               returnUrl,
          });
          return res.data;
     },

     /**
      * VNPay callback - verify payment result
      * @param params - Query parameters from VNPay redirect
      */
     vnpayCallback: async (params: Record<string, string>) => {
          const res = await apiClient.get(endpoints.payment.vnpayCallback, { params });
          return res.data;
     },
};
