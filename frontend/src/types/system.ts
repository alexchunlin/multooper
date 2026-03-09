export type NodeType = 'system' | 'subsystem' | 'module' | 'component' | 'group';

export interface SystemNode {
  id: string;
  name: string;
  type: NodeType;
  parentId: string | null;
  groupId: string | null;
  children: string[];
  members?: SystemNode[];
  description?: string;
  tags?: string[];
  x: number;
  y: number;
  width: number;
  height: number;
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
