import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  systemsApi,
  hierarchyApi,
  designAlternativesApi,
  ratingsApi,
  compatibilityApi,
  solutionsApi,
} from '../api';
import type { CreateSystemRequest, UpdateSystemRequest } from '../types/api';
import type { CreateNodeRequest, UpdateNodeRequest } from '../types/api';
import type { CreateDARequest, UpdateDARequest } from '../types/api';
import type { SubmitRatingRequest, UpdateCompatibilityRequest } from '../types/api';
import type { SaveSolutionRequest } from '../api/solutions';

// ============================================
// SYSTEMS
// ============================================

export function useSystems() {
  return useQuery({
    queryKey: ['systems'],
    queryFn: () => systemsApi.list(),
  });
}

export function useSystem(systemId: string | undefined) {
  return useQuery({
    queryKey: ['system', systemId],
    queryFn: () => systemsApi.get(systemId!),
    enabled: !!systemId,
  });
}

export function useCreateSystem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateSystemRequest) => systemsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systems'] });
    },
  });
}

export function useUpdateSystem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSystemRequest }) =>
      systemsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['systems'] });
      queryClient.invalidateQueries({ queryKey: ['system', id] });
    },
  });
}

export function useDeleteSystem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => systemsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systems'] });
    },
  });
}

// ============================================
// HIERARCHY
// ============================================

export function useHierarchy(systemId: string | undefined) {
  return useQuery({
    queryKey: ['hierarchy', systemId],
    queryFn: () => hierarchyApi.get(systemId!),
    enabled: !!systemId,
  });
}

export function useComponents(systemId: string | undefined) {
  return useQuery({
    queryKey: ['components', systemId],
    queryFn: () => hierarchyApi.getComponents(systemId!),
    enabled: !!systemId,
  });
}

export function useReplaceHierarchy() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ systemId, nodes }: { systemId: string; nodes: Parameters<typeof hierarchyApi.replace>[1] }) =>
      hierarchyApi.replace(systemId, nodes),
    onSuccess: (_, { systemId }) => {
      queryClient.invalidateQueries({ queryKey: ['hierarchy', systemId] });
      queryClient.invalidateQueries({ queryKey: ['components', systemId] });
    },
  });
}

export function useCreateNode() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ systemId, data }: { systemId: string; data: CreateNodeRequest }) =>
      hierarchyApi.createNode(systemId, data),
    onSuccess: (_, { systemId }) => {
      queryClient.invalidateQueries({ queryKey: ['hierarchy', systemId] });
      queryClient.invalidateQueries({ queryKey: ['components', systemId] });
    },
  });
}

export function useUpdateNode() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ systemId, nodeId, data }: { systemId: string; nodeId: string; data: UpdateNodeRequest }) =>
      hierarchyApi.updateNode(systemId, nodeId, data),
    onSuccess: (_, { systemId }) => {
      queryClient.invalidateQueries({ queryKey: ['hierarchy', systemId] });
    },
  });
}

export function useDeleteNode() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ systemId, nodeId }: { systemId: string; nodeId: string }) =>
      hierarchyApi.deleteNode(systemId, nodeId),
    onSuccess: (_, { systemId }) => {
      queryClient.invalidateQueries({ queryKey: ['hierarchy', systemId] });
      queryClient.invalidateQueries({ queryKey: ['components', systemId] });
      queryClient.invalidateQueries({ queryKey: ['das', systemId] });
    },
  });
}

// ============================================
// DESIGN ALTERNATIVES
// ============================================

export function useDAs(systemId: string | undefined) {
  return useQuery({
    queryKey: ['das', systemId],
    queryFn: () => designAlternativesApi.list(systemId!),
    enabled: !!systemId,
  });
}

export function useDAsByComponent(systemId: string | undefined, componentId: string | undefined) {
  return useQuery({
    queryKey: ['das', systemId, 'component', componentId],
    queryFn: () => designAlternativesApi.listByComponent(systemId!, componentId!),
    enabled: !!systemId && !!componentId,
  });
}

export function useCreateDA() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ systemId, data }: { systemId: string; data: CreateDARequest }) =>
      designAlternativesApi.create(systemId, data),
    onSuccess: (_, { systemId }) => {
      queryClient.invalidateQueries({ queryKey: ['das', systemId] });
    },
  });
}

export function useUpdateDA() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ systemId, daId, data }: { systemId: string; daId: string; data: UpdateDARequest }) =>
      designAlternativesApi.update(systemId, daId, data),
    onSuccess: (_, { systemId }) => {
      queryClient.invalidateQueries({ queryKey: ['das', systemId] });
    },
  });
}

export function useDeleteDA() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ systemId, daId }: { systemId: string; daId: string }) =>
      designAlternativesApi.delete(systemId, daId),
    onSuccess: (_, { systemId }) => {
      queryClient.invalidateQueries({ queryKey: ['das', systemId] });
      queryClient.invalidateQueries({ queryKey: ['ratings', systemId] });
      queryClient.invalidateQueries({ queryKey: ['compatibility', systemId] });
    },
  });
}

// ============================================
// RATINGS & EXPERTS
// ============================================

export function useRatings(systemId: string | undefined) {
  return useQuery({
    queryKey: ['ratings', systemId],
    queryFn: () => ratingsApi.list(systemId!),
    enabled: !!systemId,
  });
}

export function useExperts(systemId: string | undefined) {
  return useQuery({
    queryKey: ['experts', systemId],
    queryFn: () => ratingsApi.listExperts(systemId!),
    enabled: !!systemId,
  });
}

export function useCreateExpert() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ systemId, data }: { systemId: string; data: Parameters<typeof ratingsApi.createExpert>[1] }) =>
      ratingsApi.createExpert(systemId, data),
    onSuccess: (_, { systemId }) => {
      queryClient.invalidateQueries({ queryKey: ['experts', systemId] });
    },
  });
}

export function useSubmitRating() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ systemId, data }: { systemId: string; data: SubmitRatingRequest }) =>
      ratingsApi.submit(systemId, data),
    onSuccess: (_, { systemId }) => {
      queryClient.invalidateQueries({ queryKey: ['ratings', systemId] });
    },
  });
}

export function useDeleteRating() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ systemId, ratingId }: { systemId: string; ratingId: string }) =>
      ratingsApi.delete(systemId, ratingId),
    onSuccess: (_, { systemId }) => {
      queryClient.invalidateQueries({ queryKey: ['ratings', systemId] });
    },
  });
}

export function useAggregatedRatings(systemId: string | undefined) {
  return useQuery({
    queryKey: ['ratings', systemId, 'aggregated'],
    queryFn: () => ratingsApi.getAggregated(systemId!),
    enabled: !!systemId,
  });
}

// ============================================
// COMPATIBILITY
// ============================================

export function useCompatibility(systemId: string | undefined) {
  return useQuery({
    queryKey: ['compatibility', systemId],
    queryFn: () => compatibilityApi.list(systemId!),
    enabled: !!systemId,
  });
}

export function useCompatibilityMatrix(systemId: string | undefined, comp1Id: string | undefined, comp2Id: string | undefined) {
  return useQuery({
    queryKey: ['compatibility', systemId, 'matrix', comp1Id, comp2Id],
    queryFn: () => compatibilityApi.getMatrix(systemId!, comp1Id!, comp2Id!),
    enabled: !!systemId && !!comp1Id && !!comp2Id,
  });
}

export function useUpdateCompatibility() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ systemId, data }: { systemId: string; data: UpdateCompatibilityRequest }) =>
      compatibilityApi.update(systemId, data),
    onSuccess: (_, { systemId }) => {
      queryClient.invalidateQueries({ queryKey: ['compatibility', systemId] });
    },
  });
}

export function useBulkUpdateCompatibility() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ systemId, ratings }: { systemId: string; ratings: UpdateCompatibilityRequest[] }) =>
      compatibilityApi.bulkUpdate(systemId, ratings),
    onSuccess: (_, { systemId }) => {
      queryClient.invalidateQueries({ queryKey: ['compatibility', systemId] });
    },
  });
}

// ============================================
// SOLUTIONS
// ============================================

export function useSolutions(systemId: string | undefined, paretoOnly = false) {
  return useQuery({
    queryKey: ['solutions', systemId, { paretoOnly }],
    queryFn: () => solutionsApi.list(systemId!, paretoOnly),
    enabled: !!systemId,
  });
}

export function useSolutionStats(systemId: string | undefined) {
  return useQuery({
    queryKey: ['solutions', systemId, 'stats'],
    queryFn: () => solutionsApi.getStats(systemId!),
    enabled: !!systemId,
  });
}

export function useSaveSolutions() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ systemId, solutions }: { systemId: string; solutions: SaveSolutionRequest[] }) =>
      solutionsApi.saveAll(systemId, solutions),
    onSuccess: (_, { systemId }) => {
      queryClient.invalidateQueries({ queryKey: ['solutions', systemId] });
      queryClient.invalidateQueries({ queryKey: ['solutions', systemId, 'stats'] });
    },
  });
}

export function useDeleteSolutions() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (systemId: string) => solutionsApi.clearAll(systemId),
    onSuccess: (systemId) => {
      queryClient.invalidateQueries({ queryKey: ['solutions', systemId] });
      queryClient.invalidateQueries({ queryKey: ['solutions', systemId, 'stats'] });
    },
  });
}
