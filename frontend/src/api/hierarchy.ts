import api from './client';
import type { SystemNode, NodeType } from '../types/system';
import type { CreateNodeRequest, UpdateNodeRequest } from '../types/api';

export interface SystemNodeWithCounts extends SystemNode {
  _count: {
    designAlternatives: number;
    children: number;
  };
}

export interface BulkHierarchyNode {
  id?: string;
  name: string;
  type: NodeType;
  parentId?: string | null;
  description?: string;
}

export const hierarchyApi = {
  // Get full hierarchy for system
  get: async (systemId: string): Promise<SystemNodeWithCounts[]> => {
    const response = await api.get<SystemNodeWithCounts[]>(
      `/systems/${systemId}/hierarchy`
    );
    return response.data;
  },

  // Replace entire hierarchy
  replace: async (
    systemId: string,
    nodes: BulkHierarchyNode[]
  ): Promise<SystemNodeWithCounts[]> => {
    const response = await api.put<SystemNodeWithCounts[]>(
      `/systems/${systemId}/hierarchy`,
      nodes
    );
    return response.data;
  },

  // Create single node
  createNode: async (
    systemId: string,
    data: CreateNodeRequest
  ): Promise<SystemNodeWithCounts> => {
    const response = await api.post<SystemNodeWithCounts>(
      `/systems/${systemId}/hierarchy/nodes`,
      data
    );
    return response.data;
  },

  // Get single node
  getNode: async (
    systemId: string,
    nodeId: string
  ): Promise<SystemNodeWithCounts> => {
    const response = await api.get<SystemNodeWithCounts>(
      `/systems/${systemId}/hierarchy/nodes/${nodeId}`
    );
    return response.data;
  },

  // Update node
  updateNode: async (
    systemId: string,
    nodeId: string,
    data: UpdateNodeRequest
  ): Promise<SystemNodeWithCounts> => {
    const response = await api.put<SystemNodeWithCounts>(
      `/systems/${systemId}/hierarchy/nodes/${nodeId}`,
      data
    );
    return response.data;
  },

  // Delete node
  deleteNode: async (systemId: string, nodeId: string): Promise<void> => {
    await api.delete(`/systems/${systemId}/hierarchy/nodes/${nodeId}`);
  },

  // Get only component nodes
  getComponents: async (systemId: string): Promise<SystemNodeWithCounts[]> => {
    const response = await api.get<SystemNodeWithCounts[]>(
      `/systems/${systemId}/hierarchy/components`
    );
    return response.data;
  },
};
