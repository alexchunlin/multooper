export interface MultisetEstimate {
  l: number;           // Number of levels (e.g., 3)
  eta: number;         // Number of elements (e.g., 5)
  counts: number[];    // [η₁, η₂, ..., ηₗ]
}

export interface DesignAlternative {
  id: string;
  componentId: string;
  name: string;
  description?: string;
  priority?: number;  // Simple ordinal: 1, 2, 3, ...
  multisetEstimate?: MultisetEstimate;  // Advanced
  createdAt: Date;
  updatedAt: Date;
  version: number;
}
