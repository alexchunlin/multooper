import { create } from 'zustand';
import type { Solution, OptimizationConfig } from '../types/optimization';

interface OptimizationStore {
  config: OptimizationConfig | null;
  solutions: Solution[];
  paretoSolutions: Solution[];
  isRunning: boolean;
  progress: number;
  
  setConfig: (config: OptimizationConfig | null) => void;
  setSolutions: (solutions: Solution[]) => void;
  setParetoSolutions: (solutions: Solution[]) => void;
  setRunning: (isRunning: boolean) => void;
  setProgress: (progress: number) => void;
  clearResults: () => void;
}

export const useOptimizationStore = create<OptimizationStore>((set) => ({
  config: null,
  solutions: [],
  paretoSolutions: [],
  isRunning: false,
  progress: 0,
  
  setConfig: (config) => set({ config }),
  
  setSolutions: (solutions) => set({ solutions }),
  
  setParetoSolutions: (solutions) => set({ paretoSolutions: solutions }),
  
  setRunning: (isRunning) => set({ isRunning }),
  
  setProgress: (progress) => set({ progress }),
  
  clearResults: () => set({
    solutions: [],
    paretoSolutions: [],
    isRunning: false,
    progress: 0,
  }),
}));
