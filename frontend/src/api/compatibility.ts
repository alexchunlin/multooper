import api from './client';
import type { CompatibilityRating } from '../types/compatibility';
import type { UpdateCompatibilityRequest } from '../types/api';

export interface CompatibilityRatingWithDAs extends CompatibilityRating {
  da1: {
    id: string;
    name: string;
    componentId: string;
    component: {
      name: string;
    };
  };
  da2: {
    id: string;
    name: string;
    componentId: string;
    component: {
      name: string;
    };
  };
}

export interface CompatibilityMatrixResponse {
  componentAId: string;
  componentAName: string;
  componentBId: string;
  componentBName: string;
  rows: Array<{ id: string; name: string }>;
  columns: Array<{ id: string; name: string }>;
  cells: Array<Array<{
    da1Id: string;
    da2Id: string;
    value: number;
  }>>;
}

export const compatibilityApi = {
  // Get all compatibility ratings for system
  list: async (systemId: string): Promise<CompatibilityRatingWithDAs[]> => {
    const response = await api.get<CompatibilityRatingWithDAs[]>(
      `/systems/${systemId}/compatibility`
    );
    return response.data;
  },

  // Get compatibility matrix for two components
  getMatrix: async (
    systemId: string,
    comp1Id: string,
    comp2Id: string
  ): Promise<CompatibilityMatrixResponse> => {
    const response = await api.get<CompatibilityMatrixResponse>(
      `/systems/${systemId}/compatibility/matrix/${comp1Id}/${comp2Id}`
    );
    return response.data;
  },

  // Update single compatibility rating
  update: async (
    systemId: string,
    data: UpdateCompatibilityRequest
  ): Promise<CompatibilityRating> => {
    const response = await api.put<CompatibilityRating>(
      `/systems/${systemId}/compatibility`,
      data
    );
    return response.data;
  },

  // Bulk update compatibility ratings
  bulkUpdate: async (
    systemId: string,
    ratings: UpdateCompatibilityRequest[]
  ): Promise<{ updated: number }> => {
    const response = await api.put<{ updated: number }>(
      `/systems/${systemId}/compatibility/bulk`,
      ratings
    );
    return response.data;
  },

  // Delete compatibility rating
  delete: async (systemId: string, id: string): Promise<void> => {
    await api.delete(`/systems/${systemId}/compatibility/${id}`);
  },
};
