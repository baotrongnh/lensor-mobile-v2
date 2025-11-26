/**
 * System Variables API
 * Handles system configuration and settings
 */

import { apiClient } from './client';
import { endpoints } from './endpoints';

export interface DiscountRateResponse {
     data: {
          discountRate: string;
     };
     message?: string;
}

export const systemApi = {
     /**
      * Get discount rate from system variables
      */
     getDiscountRate: async (): Promise<DiscountRateResponse> => {
          const response = await apiClient.get(endpoints.systemVariables.discountRate);
          return response.data;
     },
};
