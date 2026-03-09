import type { MultisetEstimate } from './da';

export interface Rating {
  id: string;
  expertId: string;
  targetId: string;     // DA ID or component ID
  targetType: 'DA' | 'compatibility';
  ordinalValue?: number;
  multisetValue?: MultisetEstimate;
  timestamp: Date;
  notes?: string;
  confidence?: number;  // 0.0 to 1.0
}

export interface Expert {
  id: string;
  name: string;
  email: string;
  expertise: string[];
  weight: number;       // 0.0 to 1.0
  reliability: number;  // Track record (0.0 to 1.0)
}
