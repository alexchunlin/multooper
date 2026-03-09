import api from './client';
import type { Solution, QualityVector } from '../types/optimization';

export interface SolutionWithDetails extends Solution {
  selectionDetails?: Array<{
    componentId: string;
    componentName: string;
    daId: string;
    daName: string;
  }>;
}

export interface SaveSolutionRequest {
  name?: string;
  selections: Record<string, string>; // componentId -> daId
  qualityVector: QualityVector;
  isParetoEfficient: boolean;
  paretoRank?: number;
}

export interface SolutionStats {
  totalSolutions: number;
  paretoSolutions: number;
  lastRunAt: string | null;
}

export const solutionsApi = {
  // Get all solutions for system
  list: async (
    systemId: string,
    paretoOnly = false
  ): Promise<Solution[]> => {
    const response = await api.get<Solution[]>(
      `/systems/${systemId}/solutions`,
      { params: { paretoOnly: paretoOnly.toString() } }
    );
    return response.data;
  },

  // Get single solution with details
  get: async (
    systemId: string,
    solutionId: string
  ): Promise<SolutionWithDetails> => {
    const response = await api.get<SolutionWithDetails>(
      `/systems/${systemId}/solutions/${solutionId}`
    );
    return response.data;
  },

  // Save multiple solutions (replaces existing)
  saveAll: async (
    systemId: string,
    solutions: SaveSolutionRequest[]
  ): Promise<{ saved: number; paretoCount: number }> => {
    const response = await api.post<{ saved: number; paretoCount: number }>(
      `/systems/${systemId}/solutions`,
      solutions
    );
    return response.data;
  },

  // Save single solution
  saveSingle: async (
    systemId: string,
    solution: SaveSolutionRequest
  ): Promise<Solution> => {
    const response = await api.post<Solution>(
      `/systems/${systemId}/solutions/single`,
      solution
    );
    return response.data;
  },

  // Clear all solutions
  clearAll: async (systemId: string): Promise<void> => {
    await api.delete(`/systems/${systemId}/solutions`);
  },

  // Delete single solution
  delete: async (systemId: string, solutionId: string): Promise<void> => {
    await api.delete(`/systems/${systemId}/solutions/${solutionId}`);
  },

  // Get solution statistics
  getStats: async (systemId: string): Promise<SolutionStats> => {
    const response = await api.get<SolutionStats>(
      `/systems/${systemId}/solutions/stats`
    );
    return response.data;
  },
};
