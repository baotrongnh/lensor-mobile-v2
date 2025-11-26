/**
 * useDiscountRate Hook
 * Fetch and manage discount rate from system variables
 */

import { useState, useEffect } from 'react';
import { systemApi } from '../api/systemApi';
import { logger } from '../utils/logger';

export const useDiscountRate = () => {
     const [discountRate, setDiscountRate] = useState<string>('0');
     const [discountRateNum, setDiscountRateNum] = useState<number>(0);
     const [isLoading, setIsLoading] = useState(true);
     const [error, setError] = useState<Error | null>(null);

     useEffect(() => {
          const fetchDiscountRate = async () => {
               try {
                    setIsLoading(true);
                    const response = await systemApi.getDiscountRate();
                    const rate = response?.data?.discountRate || '0';
                    setDiscountRate(rate);
                    setDiscountRateNum(parseFloat(rate));
                    setError(null);
               } catch (err) {
                    logger.error('Failed to fetch discount rate:', err);
                    setError(err as Error);
                    // Keep default values
                    setDiscountRate('0');
                    setDiscountRateNum(0);
               } finally {
                    setIsLoading(false);
               }
          };

          fetchDiscountRate();
     }, []);

     const refresh = async () => {
          try {
               const response = await systemApi.getDiscountRate();
               const rate = response?.data?.discountRate || '0';
               setDiscountRate(rate);
               setDiscountRateNum(parseFloat(rate));
               setError(null);
          } catch (err) {
               logger.error('Failed to refresh discount rate:', err);
               setError(err as Error);
          }
     };

     return {
          discountRate,
          discountRateNum,
          isLoading,
          error,
          refresh,
     };
};
