// Extend Express request params types
declare global {
  namespace Express {
    interface Request {
      params: {
        systemId?: string;
        nodeId?: string;
        daId?: string;
        componentId?: string;
        comp1Id?: string;
        comp2Id?: string;
        ratingId?: string;
        expertId?: string;
        solutionId?: string;
        id?: string;
        [key: string]: string | undefined;
      };
    }
  }
}

export {};
