import { apiClient } from './client';
import { endpoints } from './endpoints';

export const paymentApi = {
     /**
      * Create PayOS payment
      * @param amount - Amount in VND
      */
     createPayos: async (amount: number) => {
          const res = await apiClient.post(endpoints.payment.payos, { amount });
          return res.data;
     },
};
