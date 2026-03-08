export type NodeType = 'system' | 'subsystem' | 'module' | 'component';

export interface SystemNode {
  id: string;
  name: string;
  type: NodeType;
  parentId: string | null;
  children: string[];
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface System {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}
