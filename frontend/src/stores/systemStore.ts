import { create } from 'zustand';
import type { SystemNode } from '../types/system';
import type { DesignAlternative } from '../types/da';
import type { Rating } from '../types/rating';
import type { CompatibilityRating } from '../types/compatibility';

interface SystemStore {
  currentSystemId: string | null;
  hierarchy: SystemNode[];
  designAlternatives: DesignAlternative[];
  ratings: Rating[];
  compatibilityRatings: CompatibilityRating[];
  selectedNodeId: string | null;
  expandedNodes: Set<string>;
  sidebarOpen: boolean;
  
  setCurrentSystem: (id: string | null) => void;
  setHierarchy: (hierarchy: SystemNode[]) => void;
  selectNode: (nodeId: string | null) => void;
  toggleNode: (nodeId: string) => void;
  expandNode: (nodeId: string) => void;
  collapseNode: (nodeId: string) => void;
  toggleSidebar: () => void;
  
  addDA: (da: DesignAlternative) => void;
  updateDA: (id: string, da: Partial<DesignAlternative>) => void;
  deleteDA: (id: string) => void;
  getDAsByComponent: (componentId: string) => DesignAlternative[];
  
  addRating: (rating: Rating) => void;
  updateRating: (id: string, rating: Partial<Rating>) => void;
  getRatingsByDA: (daId: string) => Rating[];
  
  setCompatibilityRatings: (ratings: CompatibilityRating[]) => void;
  addCompatibilityRating: (rating: CompatibilityRating) => void;
  updateCompatibilityRating: (id: string, rating: Partial<CompatibilityRating>) => void;
  getCompatibilityRating: (da1Id: string, da2Id: string) => CompatibilityRating | undefined;
}

export const useSystemStore = create<SystemStore>((set, get) => ({
  currentSystemId: null,
  hierarchy: [],
  designAlternatives: [],
  ratings: [],
  compatibilityRatings: [],
  selectedNodeId: null,
  expandedNodes: new Set<string>(),
  sidebarOpen: true,
  
  setCurrentSystem: (id) => set({ currentSystemId: id }),
  
  setHierarchy: (hierarchy) => set({ hierarchy }),
  
  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),
  
  toggleNode: (nodeId) => set((state) => {
    const newExpanded = new Set(state.expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    return { expandedNodes: newExpanded };
  }),
  
  expandNode: (nodeId) => set((state) => {
    const newExpanded = new Set(state.expandedNodes);
    newExpanded.add(nodeId);
    return { expandedNodes: newExpanded };
  }),
  
  collapseNode: (nodeId) => set((state) => {
    const newExpanded = new Set(state.expandedNodes);
    newExpanded.delete(nodeId);
    return { expandedNodes: newExpanded };
  }),
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  addDA: (da) => set((state) => ({ 
    designAlternatives: [...state.designAlternatives, da] 
  })),
  
  updateDA: (id, daUpdate) => set((state) => ({
    designAlternatives: state.designAlternatives.map(da => 
      da.id === id ? { ...da, ...daUpdate, updatedAt: new Date() } : da
    )
  })),
  
  deleteDA: (id) => set((state) => ({
    designAlternatives: state.designAlternatives.filter(da => da.id !== id)
  })),
  
  getDAsByComponent: (componentId) => {
    return get().designAlternatives.filter(da => da.componentId === componentId);
  },
  
  addRating: (rating) => set((state) => ({ 
    ratings: [...state.ratings, rating] 
  })),
  
  updateRating: (id, ratingUpdate) => set((state) => ({
    ratings: state.ratings.map(r => 
      r.id === id ? { ...r, ...ratingUpdate } : r
    )
  })),
  
  getRatingsByDA: (daId) => {
    return get().ratings.filter(r => r.targetId === daId);
  },
  
  setCompatibilityRatings: (ratings) => set({ compatibilityRatings: ratings }),
  
  addCompatibilityRating: (rating) => set((state) => ({
    compatibilityRatings: [...state.compatibilityRatings, rating]
  })),
  
  updateCompatibilityRating: (id, ratingUpdate) => set((state) => ({
    compatibilityRatings: state.compatibilityRatings.map(r => 
      r.id === id ? { ...r, ...ratingUpdate } : r
    )
  })),
  
  getCompatibilityRating: (da1Id, da2Id) => {
    return get().compatibilityRatings.find(r => 
      (r.da1Id === da1Id && r.da2Id === da2Id) ||
      (r.da1Id === da2Id && r.da2Id === da1Id)
    );
  },
}));
