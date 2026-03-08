import api from './client';
import type { DesignAlternative } from '../types/da';
import type { CreateDARequest, UpdateDARequest } from '../types/api';

export interface DAWithComponent extends DesignAlternative {
  component: {
    id: string;
    name: string;
    type: string;
  };
  _count?: {
    ratings: number;
  };
}

export const designAlternativesApi = {
  // List all DAs for system
  list: async (systemId: string): Promise<DAWithComponent[]> => {
    const response = await api.get<DAWithComponent[]>(
      `/systems/${systemId}/das`
    );
    return response.data;
  },

  // List DAs for specific component
  listByComponent: async (
    systemId: string,
    componentId: string
  ): Promise<DesignAlternative[]> => {
    const response = await api.get<DesignAlternative[]>(
      `/systems/${systemId}/das/by-component/${componentId}`
    );
    return response.data;
  },

  // Get single DA
  get: async (systemId: string, daId: string): Promise<DAWithComponent> => {
    const response = await api.get<DAWithComponent>(
      `/systems/${systemId}/das/${daId}`
    );
    return response.data;
  },

  // Create DA
  create: async (
    systemId: string,
    data: CreateDARequest
  ): Promise<DAWithComponent> => {
    const response = await api.post<DAWithComponent>(
      `/systems/${systemId}/das`,
      data
    );
    return response.data;
  },

  // Update DA
  update: async (
    systemId: string,
    daId: string,
    data: UpdateDARequest
  ): Promise<DAWithComponent> => {
    const response = await api.put<DAWithComponent>(
      `/systems/${systemId}/das/${daId}`,
      data
    );
    return response.data;
  },

  // Delete DA
  delete: async (systemId: string, daId: string): Promise<void> => {
    await api.delete(`/systems/${systemId}/das/${daId}`);
  },

  // Bulk create DAs
  bulkCreate: async (
    systemId: string,
    data: CreateDARequest[]
  ): Promise<{ created: number }> => {
    const response = await api.post<{ created: number }>(
      `/systems/${systemId}/das/bulk`,
      data
    );
    return response.data;
  },
};
