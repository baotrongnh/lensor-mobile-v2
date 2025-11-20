/**
 * Marketplace Hooks
 * Custom hooks để fetch marketplace data - giống web version
 */

import { useState, useEffect, useCallback } from 'react';
import { marketplaceApi } from '../api/marketplaceApi';
import { MarketplaceItem, MarketplaceDetail } from '@/types/marketplace';

/**
 * Hook để get tất cả marketplace items
 */
export const useMarketplace = () => {
     const [data, setData] = useState<{ data: MarketplaceItem[] } | null>(null);
     const [error, setError] = useState<Error | null>(null);
     const [isLoading, setIsLoading] = useState(true);
     const [isValidating, setIsValidating] = useState(false);

     const fetchMarketplace = useCallback(async () => {
          try {
               setIsValidating(true);
               const result = await marketplaceApi.getAll();
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
          fetchMarketplace();
     }, [fetchMarketplace]);

     const mutate = useCallback(() => {
          fetchMarketplace();
     }, [fetchMarketplace]);

     return { data, error, isLoading, mutate, isValidating };
};

/**
 * Hook để get marketplace detail by id
 */
export const useMarketplaceDetail = (id: string) => {
     const [dataRaw, setDataRaw] = useState<{ data: MarketplaceDetail } | null>(null);
     const [error, setError] = useState<Error | null>(null);
     const [isLoading, setIsLoading] = useState(true);

     const fetchDetail = useCallback(async () => {
          try {
               const result = await marketplaceApi.getById(id);
               setDataRaw(result);
               setError(null);
          } catch (err) {
               setError(err as Error);
          } finally {
               setIsLoading(false);
          }
     }, [id]);

     useEffect(() => {
          fetchDetail();
     }, [fetchDetail]);

     const mutate = useCallback(() => {
          fetchDetail();
     }, [fetchDetail]);

     const data = dataRaw?.data;

     return { data, error, isLoading, mutate };
};

/**
 * Hook để get own products
 */
export const useOwnProducts = () => {
     const [data, setData] = useState<any>(null);
     const [error, setError] = useState<Error | null>(null);
     const [isLoading, setIsLoading] = useState(true);
     const [isValidating, setIsValidating] = useState(false);

     const fetchOwnProducts = useCallback(async () => {
          try {
               setIsValidating(true);
               const result = await marketplaceApi.getOwn();
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
          fetchOwnProducts();
     }, [fetchOwnProducts]);

     const mutate = useCallback(() => {
          fetchOwnProducts();
     }, [fetchOwnProducts]);

     return { data, error, isLoading, mutate, isValidating };
};

/**
 * Hook để create review
 */
export const useCreateReview = () => {
     const createReview = async (productId: string, payload: { rating: number; comment: string }) => {
          return await marketplaceApi.createReview(productId, payload);
     };
     return { createReview };
};
