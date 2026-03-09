export interface CompatibilityRating {
  id: string;
  da1Id: string;
  da2Id: string;
  value: number;        // 0, 1, 2, ..., ν
  expertRatings: Record<string, number>;  // expertId -> rating
  aggregationMethod: 'min' | 'median' | 'average' | 'weighted';
  timestamp: Date;
  version: number;
}

export interface CompatibilityMatrix {
  componentAId: string;
  componentBId: string;
  rows: Array<{ id: string; name: string }>;
  columns: Array<{ id: string; name: string }>;
  cells: CompatibilityCell[][];
}

export interface CompatibilityCell {
  da1Id: string;
  da2Id: string;
  value: number;
  expertRatings?: Record<string, number>;
}
