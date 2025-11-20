/**
 * Post Hooks
 * Custom hooks để fetch data posts
 */

import { useState, useEffect, useCallback } from 'react';
import { postApi } from '../api/postApi';
import { PostType, SavedPostsResponse } from '@/types/post';

export const usePosts = () => {
     const [data, setData] = useState<{ data: PostType[] } | null>(null);
     const [error, setError] = useState<Error | null>(null);
     const [isLoading, setIsLoading] = useState(true);
     const [isValidating, setIsValidating] = useState(false);

     const fetchPosts = useCallback(async () => {
          try {
               setIsValidating(true);
               const result = await postApi.getAll();
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
          fetchPosts();
     }, [fetchPosts]);

     const mutate = useCallback(() => {
          fetchPosts();
     }, [fetchPosts]);

     return { data, error, isLoading, mutate, isValidating };
};

export const usePostDetail = (id: string) => {
     const [data, setData] = useState<PostType | null>(null);
     const [error, setError] = useState<Error | null>(null);
     const [isLoading, setIsLoading] = useState(true);

     const fetchPost = useCallback(async () => {
          try {
               const result = await postApi.getById(id);
               setData(result);
               setError(null);
          } catch (err) {
               setError(err as Error);
          } finally {
               setIsLoading(false);
          }
     }, [id]);

     useEffect(() => {
          fetchPost();
     }, [fetchPost]);

     const mutate = useCallback(() => {
          fetchPost();
     }, [fetchPost]);

     return { data, error, isLoading, mutate };
};

export const useComments = (postId: string) => {
     const [data, setData] = useState<any>(null);
     const [error, setError] = useState<Error | null>(null);
     const [isLoading, setIsLoading] = useState(true);

     const fetchComments = useCallback(async () => {
          try {
               const result = await postApi.getComments(postId);
               setData(result);
               setError(null);
          } catch (err) {
               setError(err as Error);
          } finally {
               setIsLoading(false);
          }
     }, [postId]);

     useEffect(() => {
          fetchComments();
     }, [fetchComments]);

     const mutate = useCallback(() => {
          fetchComments();
     }, [fetchComments]);

     return { data, error, isLoading, mutate };
};

export const useSavedPosts = (limit: number = 20, offset: number = 0) => {
     const [data, setData] = useState<any>(null);
     const [error, setError] = useState<Error | null>(null);
     const [isLoading, setIsLoading] = useState(true);
     const [isValidating, setIsValidating] = useState(false);

     const fetchSavedPosts = useCallback(async () => {
          try {
               setIsValidating(true);
               const result = await postApi.getSavedPosts(limit, offset);
               // API already transforms data and sets isSaved to true
               setData(result);
               setError(null);
          } catch (err) {
               setError(err as Error);
          } finally {
               setIsLoading(false);
               setIsValidating(false);
          }
     }, [limit, offset]);

     useEffect(() => {
          fetchSavedPosts();
     }, [fetchSavedPosts]);

     const mutate = useCallback(() => {
          fetchSavedPosts();
     }, [fetchSavedPosts]);

     return { data, error, isLoading, mutate, isValidating };
};
