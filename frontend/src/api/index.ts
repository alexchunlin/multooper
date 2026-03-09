// Re-export all API modules
export { default as apiClient } from './client';
export { systemsApi } from './systems';
export { hierarchyApi } from './hierarchy';
export { designAlternativesApi } from './designAlternatives';
export { ratingsApi } from './ratings';
export { compatibilityApi } from './compatibility';
export { solutionsApi } from './solutions';

// Re-export types
export type { SystemWithCounts } from './systems';
export type { SystemNodeWithCounts, BulkHierarchyNode } from './hierarchy';
export type { DAWithComponent } from './designAlternatives';
export type { RatingWithRelations, ExpertWithCount, AggregatedRating } from './ratings';
export type { CompatibilityRatingWithDAs, CompatibilityMatrixResponse } from './compatibility';
export type { SolutionWithDetails, SaveSolutionRequest, SolutionStats } from './solutions';
