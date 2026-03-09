export interface QualityVector {
  w: number;            // Compatibility quality
  e: number[];          // Element quality [η₁, η₂, ..., ηₗ]
  wLabel: string;       // "Good" (if w=3)
  eLabel: string;       // "(3, 0, 0)"
}

export interface Solution {
  id: string;
  systemId: string;
  name?: string;
  selections: Record<string, string>;  // componentId -> daId
  qualityVector: QualityVector;
  isParetoEfficient: boolean;
  paretoRank?: number;  // 1 = best
  createdAt: Date;
  version: number;
}

export interface OptimizationConfig {
  systemId: string;
  componentIds: string[];
  requiredDAIds?: string[];
  forbiddenDAIds?: string[];
  method: 'HMMD';
  aggregationMethod: 'min' | 'median' | 'average' | 'weighted';
}

export interface OptimizationResult {
  totalSolutions: number;
  paretoSolutions: number;
  executionTime: number;
  bestQualityVector?: QualityVector;
  solutions: Solution[];
}
