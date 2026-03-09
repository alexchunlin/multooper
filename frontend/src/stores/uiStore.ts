import { create } from 'zustand';

interface UIStore {
  theme: 'light' | 'dark';
  isLoading: boolean;
  loadingMessage: string;
  
  setTheme: (theme: 'light' | 'dark') => void;
  setLoading: (isLoading: boolean, message?: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  theme: 'light',
  isLoading: false,
  loadingMessage: '',
  
  setTheme: (theme) => set({ theme }),
  
  setLoading: (isLoading, message = '') => set({
    isLoading,
    loadingMessage: message,
  }),
}));
