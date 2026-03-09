export interface CreateSystemRequest {
  name: string;
  description?: string;
}

export interface UpdateSystemRequest {
  name?: string;
  description?: string;
}

export interface CreateNodeRequest {
  name: string;
  type: import('./system').NodeType;
  parentId?: string;
  groupId?: string;
  description?: string;
  tags?: string[];
  x?: number;
  y?: number;
}

export interface UpdateNodeRequest {
  name?: string;
  description?: string;
  parentId?: string | null;
  groupId?: string | null;
  tags?: string[];
  x?: number;
  y?: number;
}

export interface CreateDARequest {
  componentId: string;
  name: string;
  description?: string;
  priority?: number;
  multisetEstimate?: import('./da').MultisetEstimate;
}

export interface UpdateDARequest {
  name?: string;
  description?: string;
  priority?: number;
  multisetEstimate?: import('./da').MultisetEstimate;
}

export interface SubmitRatingRequest {
  daId: string;
  expertId: string;
  ordinalValue?: number;
  multisetValue?: import('./da').MultisetEstimate;
  confidence?: number;
  notes?: string;
}

export interface UpdateCompatibilityRequest {
  da1Id: string;
  da2Id: string;
  value: number;
  expertId?: string;
}

export interface ExportOptions {
  format: 'excel' | 'csv';
  includeRatings?: boolean;
  includeCompatibility?: boolean;
}
