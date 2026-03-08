import type { Request, Response, NextFunction } from 'express';

// Common route params
export interface SystemParams {
  systemId: string;
}

export interface NodeParams extends SystemParams {
  nodeId: string;
}

export interface DAParams extends SystemParams {
  daId: string;
}

export interface ComponentParams extends SystemParams {
  componentId: string;
}

export interface CompatibilityMatrixParams extends SystemParams {
  comp1Id: string;
  comp2Id: string;
}

export interface RatingParams extends SystemParams {
  ratingId: string;
}

export interface ExpertParams extends SystemParams {
  expertId: string;
}

export interface SolutionParams extends SystemParams {
  solutionId: string;
}

export interface IdParams extends SystemParams {
  id: string;
}

// Typed request handler
export type TypedRequest<P = object, B = object, Q = object> = Request<P, unknown, B, Q>;

// Async handler type
export type AsyncHandler<P = object, B = object, Q = object> = (
  req: TypedRequest<P, B, Q>,
  res: Response,
  next: NextFunction
) => Promise<void>;
