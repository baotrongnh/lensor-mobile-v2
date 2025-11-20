/**
 * User Store
 * Quản lý state của user
 */

import { create } from 'zustand';

interface User {
     id: string;
     email: string;
     name: string;
     avatarUrl?: string;
}

interface UserStore {
     user: User | null;
     isLoading: boolean;
     setUser: (user: User | null) => void;
     setLoading: (loading: boolean) => void;
     logout: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
     user: null,
     isLoading: true,
     setUser: (user) => set({ user, isLoading: false }),
     setLoading: (loading) => set({ isLoading: loading }),
     logout: () => set({ user: null, isLoading: false }),
}));
