import { apiClient } from './client';
import { endpoints } from './endpoints';

export const forumApi = {
     getAll: async () => {
          const res = await apiClient.get(endpoints.forum.all);
          return res.data;
     },
};
