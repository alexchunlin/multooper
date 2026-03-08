import api from './client';
import type { System } from '../types/system';
import type { CreateSystemRequest, UpdateSystemRequest } from '../types/api';

export interface SystemWithCounts extends System {
  _count: {
    nodes: number;
    solutions: number;
    experts?: number;
  };
}

export const systemsApi = {
  // List all systems
  list: async (): Promise<SystemWithCounts[]> => {
    const response = await api.get<SystemWithCounts[]>('/systems');
    return response.data;
  },

  // Get single system
  get: async (id: string): Promise<SystemWithCounts> => {
    const response = await api.get<SystemWithCounts>(`/systems/${id}`);
    return response.data;
  },

  // Create system
  create: async (data: CreateSystemRequest): Promise<System> => {
    const response = await api.post<System>('/systems', data);
    return response.data;
  },

  // Update system
  update: async (id: string, data: UpdateSystemRequest): Promise<System> => {
    const response = await api.put<System>(`/systems/${id}`, data);
    return response.data;
  },

  // Delete system
  delete: async (id: string): Promise<void> => {
    await api.delete(`/systems/${id}`);
  },
};
