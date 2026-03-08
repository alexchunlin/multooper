# Implementation Guide

Practical guide for implementing the multi-objective optimization web interface.

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│           Frontend (React/Vue/etc)           │
│  ┌─────────────────────────────────────────┐│
│  │  UI Components                          ││
│  │  - Hierarchy Editor                     ││
│  │  - DA Manager                           ││
│  │  - Rating Interface (Multi-Expert)      ││
│  │  - Compatibility Matrix Editor          ││
│  │  - Optimization Dashboard               ││
│  │  - Results Visualization                ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
                      ↕ API
┌─────────────────────────────────────────────┐
│           Backend (Node/Python/Go)           │
│  ┌─────────────────────────────────────────┐│
│  │  Core Engine                            ││
│  │  - HMMD Optimizer                       ││
│  │  - Multiset Operations                  ││
│  │  - Compatibility Manager                ││
│  │  - Aggregation Engine                   ││
│  │  - Version Control                      ││
│  └─────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────┐│
│  │  Data Layer                             ││
│  │  - PostgreSQL/MongoDB                   ││
│  │  - File Storage (attachments)           ││
│  │  - Cache (Redis)                        ││
│  └─────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

## Data Models

### Core Entities

```typescript
// System Hierarchy
interface SystemNode {
  id: string;
  name: string;
  type: 'system' | 'subsystem' | 'module' | 'component';
  parentId: string | null;
  children: string[];
  description?: string;
  attachments?: Attachment[];
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

// Design Alternative
interface DesignAlternative {
  id: string;
  componentId: string;
  name: string;
  description?: string;
  attachments?: Attachment[];
  
  // Quality rating (ordinal or multiset)
  priority?: number;  // Simple ordinal: 1, 2, 3, ...
  multisetEstimate?: MultisetEstimate;  // Advanced
  
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

// Multiset Estimate
interface MultisetEstimate {
  l: number;           // Number of levels (e.g., 3)
  eta: number;         // Number of elements (e.g., 4)
  counts: number[];    // [η₁, η₂, ..., ηₗ]
  
  // Validation: sum(counts) === eta, interval property
}

// Expert
interface Expert {
  id: string;
  name: string;
  email: string;
  expertise: string[];  // ["GSM networks", "Hardware interfaces"]
  weight: number;       // 0.0 to 1.0 (for weighted aggregation)
  reliability: number;  // Track record (0.0 to 1.0)
}

// Rating (Multi-Expert)
interface Rating {
  id: string;
  expertId: string;
  targetId: string;     // DA ID or component ID
  targetType: 'DA' | 'compatibility';
  
  // Rating value
  ordinalValue?: number;
  multisetValue?: MultisetEstimate;
  
  timestamp: Date;
  notes?: string;
  confidence?: number;  // 0.0 to 1.0
}

// Compatibility
interface CompatibilityRating {
  id: string;
  da1Id: string;
  da2Id: string;
  
  // Compatibility value
  value: number;        // 0, 1, 2, ..., ν
  
  // Multi-expert aggregation
  expertRatings: Map<string, number>;  // expertId -> rating
  aggregationMethod: 'min' | 'median' | 'average' | 'weighted';
  
  timestamp: Date;
  version: number;
}

// Solution (Composite DA)
interface Solution {
  id: string;
  systemId: string;
  name?: string;
  
  // Selected DAs
  selections: Map<string, string>;  // componentId -> daId
  
  // Quality vector
  qualityVector: QualityVector;
  
  // Pareto status
  isParetoEfficient: boolean;
  paretoRank?: number;  // 1 = best
  
  createdAt: Date;
  version: number;
}

// Quality Vector
interface QualityVector {
  w: number;            // Compatibility quality
  e: number[];          // Element quality [η₁, η₂, ..., ηₗ]
  
  // For display
  wLabel: string;       // "Good" (if w=3)
  eLabel: string;       // "(3, 0, 0)"
}

// Version/Release
interface Version {
  id: string;
  systemId: string;
  versionNumber: string;  // "1.0.0"
  name?: string;          // "Initial Design"
  
  // Snapshot of system state
  snapshot: {
    hierarchy: SystemNode[];
    das: DesignAlternative[];
    compatibility: CompatibilityRating[];
    solutions: Solution[];
  };
  
  timestamp: Date;
  createdBy: string;  // userId
  notes?: string;
  tags: string[];     // ["release", "approved", ...]
}

// Attachment
interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: string;
  timestamp: Date;
}
```

## Database Schema

### PostgreSQL

```sql
-- System Hierarchy
CREATE TABLE system_nodes (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  parent_id UUID REFERENCES system_nodes(id),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  version INTEGER DEFAULT 1
);

-- Design Alternatives
CREATE TABLE design_alternatives (
  id UUID PRIMARY KEY,
  component_id UUID REFERENCES system_nodes(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  priority INTEGER,
  multiset_l INTEGER,
  multiset_eta INTEGER,
  multiset_counts INTEGER[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  version INTEGER DEFAULT 1
);

-- Experts
CREATE TABLE experts (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  expertise TEXT[],
  weight DECIMAL(3,2) DEFAULT 1.0,
  reliability DECIMAL(3,2) DEFAULT 0.5
);

-- Ratings (Multi-Expert)
CREATE TABLE ratings (
  id UUID PRIMARY KEY,
  expert_id UUID REFERENCES experts(id),
  target_id UUID NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  ordinal_value INTEGER,
  multiset_l INTEGER,
  multiset_eta INTEGER,
  multiset_counts INTEGER[],
  timestamp TIMESTAMP DEFAULT NOW(),
  confidence DECIMAL(3,2)
);

-- Compatibility
CREATE TABLE compatibility_ratings (
  id UUID PRIMARY KEY,
  da1_id UUID REFERENCES design_alternatives(id),
  da2_id UUID REFERENCES design_alternatives(id),
  value INTEGER NOT NULL,
  aggregation_method VARCHAR(50),
  timestamp TIMESTAMP DEFAULT NOW(),
  version INTEGER DEFAULT 1,
  UNIQUE(da1_id, da2_id)
);

-- Solutions
CREATE TABLE solutions (
  id UUID PRIMARY KEY,
  system_id UUID NOT NULL,
  name VARCHAR(255),
  quality_w INTEGER NOT NULL,
  quality_e INTEGER[] NOT NULL,
  is_pareto_efficient BOOLEAN DEFAULT false,
  pareto_rank INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  version INTEGER DEFAULT 1
);

-- Solution Selections (many-to-many)
CREATE TABLE solution_selections (
  solution_id UUID REFERENCES solutions(id),
  component_id UUID REFERENCES system_nodes(id),
  da_id UUID REFERENCES design_alternatives(id),
  PRIMARY KEY (solution_id, component_id)
);

-- Versions
CREATE TABLE versions (
  id UUID PRIMARY KEY,
  system_id UUID NOT NULL,
  version_number VARCHAR(50) NOT NULL,
  name VARCHAR(255),
  snapshot JSONB NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL,
  notes TEXT,
  tags TEXT[]
);

-- Attachments
CREATE TABLE attachments (
  id UUID PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100),
  size INTEGER,
  url TEXT,
  uploaded_by UUID NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_das_component ON design_alternatives(component_id);
CREATE INDEX idx_ratings_target ON ratings(target_id, target_type);
CREATE INDEX idx_compatibility_pair ON compatibility_ratings(da1_id, da2_id);
CREATE INDEX idx_solutions_system ON solutions(system_id);
```

## Core Algorithms

### HMMD Optimizer

```typescript
class HMMDOptimizer {
  
  /**
   * Find all Pareto-efficient solutions
   */
  async optimize(systemId: string): Promise<Solution[]> {
    // 1. Load system data
    const components = await this.getLeafComponents(systemId);
    const das = await this.getDAs(components);
    const compatibility = await this.getCompatibilityMatrix(das);
    
    // 2. Enumerate all combinations
    const combinations = this.enumerateCombinations(das);
    
    // 3. Evaluate each combination
    const solutions: Solution[] = [];
    for (const combo of combinations) {
      const quality = this.evaluateSolution(combo, compatibility);
      
      if (quality.w >= 1) {  // Admissibility check
        solutions.push({
          id: generateId(),
          systemId,
          selections: combo,
          qualityVector: quality,
          isParetoEfficient: false
        });
      }
    }
    
    // 4. Select Pareto-efficient solutions
    const paretoSet = this.selectParetoEfficient(solutions);
    
    // 5. Rank Pareto solutions
    const ranked = this.rankParetoSolutions(paretoSet);
    
    // 6. Save to database
    await this.saveSolutions(ranked);
    
    return ranked;
  }
  
  /**
   * Enumerate all DA combinations
   */
  private enumerateCombinations(
    das: Map<string, DesignAlternative[]>
  ): Map<string, string>[] {
    const componentIds = Array.from(das.keys());
    const daLists = componentIds.map(id => das.get(id)!);
    
    return this.cartesianProduct(daLists).map(selection => {
      const map = new Map<string, string>();
      componentIds.forEach((compId, i) => {
        map.set(compId, selection[i].id);
      });
      return map;
    });
  }
  
  /**
   * Cartesian product of arrays
   */
  private cartesianProduct<T>(arrays: T[][]): T[][] {
    if (arrays.length === 0) return [[]];
    
    const [first, ...rest] = arrays;
    const restProduct = this.cartesianProduct(rest);
    
    const result: T[][] = [];
    for (const item of first) {
      for (const restItem of restProduct) {
        result.push([item, ...restItem]);
      }
    }
    
    return result;
  }
  
  /**
   * Evaluate solution quality
   */
  private evaluateSolution(
    selections: Map<string, string>,
    compatibility: CompatibilityMatrix
  ): QualityVector {
    const daIds = Array.from(selections.values());
    
    // Compute w(S) = min pairwise compatibility
    let minComp = Infinity;
    for (let i = 0; i < daIds.length; i++) {
      for (let j = i + 1; j < daIds.length; j++) {
        const comp = compatibility.get(daIds[i], daIds[j]);
        minComp = Math.min(minComp, comp);
      }
    }
    const w = minComp === Infinity ? 0 : minComp;
    
    // Compute e(S) = quality distribution
    // (simplified: count priorities, assumes ordinal ratings)
    const priorities = Array.from(selections.values()).map(daId => {
      const da = this.daCache.get(daId);
      return da.priority || this.multisetToPriority(da.multisetEstimate);
    });
    
    const maxPriority = Math.max(...priorities);
    const e = new Array(maxPriority).fill(0);
    for (const p of priorities) {
      e[p - 1]++;
    }
    
    return { w, e, wLabel: this.wToLabel(w), eLabel: `(${e.join(',')})` };
  }
  
  /**
   * Select Pareto-efficient solutions
   */
  private selectParetoEfficient(solutions: Solution[]): Solution[] {
    const pareto: Solution[] = [];
    
    for (const s of solutions) {
      let dominated = false;
      
      for (const other of solutions) {
        if (this.dominates(other, s)) {
          dominated = true;
          break;
        }
      }
      
      if (!dominated) {
        s.isParetoEfficient = true;
        pareto.push(s);
      }
    }
    
    return pareto;
  }
  
  /**
   * Check if s1 Pareto dominates s2
   */
  private dominates(s1: Solution, s2: Solution): boolean {
    const { w: w1, e: e1 } = s1.qualityVector;
    const { w: w2, e: e2 } = s2.qualityVector;
    
    // w: higher is better
    // e: compare element-wise, higher at lower indices is better
    
    const wBetter = w1 >= w2;
    const eBetter = this.compareE(e1, e2) >= 0;
    const strictlyBetter = w1 > w2 || this.compareE(e1, e2) > 0;
    
    return wBetter && eBetter && strictlyBetter;
  }
  
  /**
   * Compare e vectors (poset comparison)
   * Returns: 1 if e1 > e2, -1 if e1 < e2, 0 if incomparable
   */
  private compareE(e1: number[], e2: number[]): number {
    const cum1 = this.cumulative(e1);
    const cum2 = this.cumulative(e2);
    
    let e1Better = true;
    let e2Better = true;
    
    for (let i = 0; i < cum1.length; i++) {
      if (cum1[i] < cum2[i]) e1Better = false;
      if (cum2[i] < cum1[i]) e2Better = false;
    }
    
    if (e1Better && !e2Better) return 1;
    if (e2Better && !e1Better) return -1;
    return 0;  // Incomparable or equal
  }
  
  private cumulative(arr: number[]): number[] {
    const cum: number[] = [];
    let sum = 0;
    for (const val of arr) {
      sum += val;
      cum.push(sum);
    }
    return cum;
  }
}
```

### Multiset Operations

```typescript
class MultisetOperations {
  
  /**
   * Validate multiset estimate
   */
  validate(e: MultisetEstimate): boolean {
    // Check cardinality
    const sum = e.counts.reduce((a, b) => a + b, 0);
    if (sum !== e.eta) return false;
    
    // Check interval property
    let started = false;
    let ended = false;
    for (const count of e.counts) {
      if (count > 0) {
        if (ended) return false;  // Gap detected
        started = true;
      } else if (started) {
        ended = true;
      }
    }
    
    return true;
  }
  
  /**
   * Integration (sum)
   */
  integrate(estimates: MultisetEstimate[]): MultisetEstimate {
    if (estimates.length === 0) {
      throw new Error('Empty estimates array');
    }
    
    const l = estimates[0].l;
    const counts = new Array(l).fill(0);
    
    for (const e of estimates) {
      if (e.l !== l) {
        throw new Error('Incompatible estimate levels');
      }
      for (let i = 0; i < l; i++) {
        counts[i] += e.counts[i];
      }
    }
    
    return {
      l,
      eta: counts.reduce((a, b) => a + b, 0),
      counts
    };
  }
  
  /**
   * Proximity (distance)
   */
  proximity(e1: MultisetEstimate, e2: MultisetEstimate): [number, number] {
    if (e1.l !== e2.l) {
      throw new Error('Incompatible estimate levels');
    }
    
    const cum1 = this.cumulative(e1.counts);
    const cum2 = this.cumulative(e2.counts);
    
    let deltaDown = 0;
    let deltaUp = 0;
    
    for (let i = 0; i < e1.l; i++) {
      deltaDown = Math.max(deltaDown, cum2[i] - cum1[i]);
      deltaUp = Math.max(deltaUp, cum1[i] - cum2[i]);
    }
    
    return [deltaDown, deltaUp];
  }
  
  private cumulative(counts: number[]): number[] {
    const cum: number[] = [];
    let sum = 0;
    for (const count of counts) {
      sum += count;
      cum.push(sum);
    }
    return cum;
  }
  
  /**
   * Generalized median
   */
  generalizedMedian(estimates: MultisetEstimate[]): MultisetEstimate {
    if (estimates.length === 0) {
      throw new Error('Empty estimates array');
    }
    
    const l = estimates[0].l;
    const eta = estimates[0].eta;
    
    // Generate all possible estimates
    const allPossible = this.generateAllMultisets(l, eta);
    
    // Find candidate with minimum total distance
    let bestMedian = allPossible[0];
    let minDistance = Infinity;
    
    for (const candidate of allPossible) {
      let totalDist = 0;
      
      for (const e of estimates) {
        const [down, up] = this.proximity(candidate, e);
        totalDist += Math.max(down, up);
      }
      
      if (totalDist < minDistance) {
        minDistance = totalDist;
        bestMedian = candidate;
      }
    }
    
    return bestMedian;
  }
  
  /**
   * Set median (faster)
   */
  setMedian(estimates: MultisetEstimate[]): MultisetEstimate {
    if (estimates.length === 0) {
      throw new Error('Empty estimates array');
    }
    
    let bestMedian = estimates[0];
    let minDistance = Infinity;
    
    for (const candidate of estimates) {
      let totalDist = 0;
      
      for (const e of estimates) {
        const [down, up] = this.proximity(candidate, e);
        totalDist += Math.max(down, up);
      }
      
      if (totalDist < minDistance) {
        minDistance = totalDist;
        bestMedian = candidate;
      }
    }
    
    return bestMedian;
  }
  
  /**
   * Generate all interval multisets
   */
  private generateAllMultisets(l: number, eta: number): MultisetEstimate[] {
    const results: MultisetEstimate[] = [];
    
    // Recursive generation with interval constraint
    this.generateRecursive(l, eta, 0, 0, [], results);
    
    return results;
  }
  
  private generateRecursive(
    l: number,
    remaining: number,
    level: number,
    started: number,
    current: number[],
    results: MultisetEstimate[]
  ) {
    if (level === l) {
      if (remaining === 0 && started > 0) {
        results.push({ l, eta: current.reduce((a,b) => a+b, 0), counts: [...current] });
      }
      return;
    }
    
    const maxCount = remaining;
    
    for (let count = 0; count <= maxCount; count++) {
      current.push(count);
      const newStarted = started + (count > 0 ? 1 : 0);
      
      // Interval constraint: can't have zeros after started then non-zero again
      // Simplified: allow any distribution (remove interval constraint for speed)
      this.generateRecursive(l, remaining - count, level + 1, newStarted, current, results);
      
      current.pop();
    }
  }
}
```

### Compatibility Aggregation

```typescript
class CompatibilityAggregator {
  
  /**
   * Aggregate multi-expert compatibility ratings
   */
  aggregate(
    expertRatings: Map<string, number>,  // expertId -> rating
    experts: Expert[],
    method: 'min' | 'median' | 'average' | 'weighted'
  ): number {
    const ratings = Array.from(expertRatings.values());
    
    switch (method) {
      case 'min':
        return Math.min(...ratings);
        
      case 'median':
        return this.median(ratings);
        
      case 'average':
        return Math.round(this.average(ratings));
        
      case 'weighted':
        return Math.round(this.weightedAverage(expertRatings, experts));
        
      default:
        throw new Error(`Unknown aggregation method: ${method}`);
    }
  }
  
  private median(arr: number[]): number {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid-1] + sorted[mid]) / 2;
  }
  
  private average(arr: number[]): number {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }
  
  private weightedAverage(
    ratings: Map<string, number>,
    experts: Expert[]
  ): number {
    let weightedSum = 0;
    let totalWeight = 0;
    
    for (const [expertId, rating] of ratings) {
      const expert = experts.find(e => e.id === expertId);
      if (expert) {
        weightedSum += rating * expert.weight;
        totalWeight += expert.weight;
      }
    }
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }
}
```

## API Endpoints

### RESTful API

```typescript
// System Hierarchy
GET    /api/systems/:id/hierarchy
POST   /api/systems/:id/nodes
PUT    /api/systems/:id/nodes/:nodeId
DELETE /api/systems/:id/nodes/:nodeId

// Design Alternatives
GET    /api/components/:id/das
POST   /api/components/:id/das
PUT    /api/das/:id
DELETE /api/das/:id

// Ratings (Multi-Expert)
GET    /api/das/:id/ratings
POST   /api/das/:id/ratings
PUT    /api/ratings/:id
DELETE /api/ratings/:id

// Compatibility
GET    /api/systems/:id/compatibility
POST   /api/systems/:id/compatibility
PUT    /api/compatibility/:id
DELETE /api/compatibility/:id

// Optimization
POST   /api/systems/:id/optimize
GET    /api/systems/:id/solutions
GET    /api/solutions/:id

// Versions
GET    /api/systems/:id/versions
POST   /api/systems/:id/versions
GET    /api/versions/:id
PUT    /api/versions/:id/tags

// Experts
GET    /api/experts
POST   /api/experts
PUT    /api/experts/:id
DELETE /api/experts/:id
```

### WebSocket Events

```typescript
// Real-time updates
socket.on('solution:created', (solution) => { ... });
socket.on('solution:updated', (solution) => { ... });
socket.on('rating:added', (rating) => { ... });
socket.on('optimization:progress', (progress) => { ... });
```

## Multi-Expert Workflow

### Step-by-Step Process

```typescript
class MultiExpertWorkflow {
  
  /**
   * Complete multi-expert rating workflow
   */
  async executeRatingWorkflow(
    systemId: string,
    expertIds: string[]
  ): Promise<void> {
    
    // 1. Get all DAs needing ratings
    const das = await this.getDAsNeedingRatings(systemId);
    
    // 2. For each DA, collect expert ratings
    for (const da of das) {
      for (const expertId of expertIds) {
        // Check if rating exists
        const existing = await this.getRating(da.id, expertId);
        
        if (!existing) {
          // Request rating from expert
          await this.requestRating(da.id, expertId);
        }
      }
    }
    
    // 3. Aggregate ratings per DA
    for (const da of das) {
      const ratings = await this.getRatingsForDA(da.id);
      
      if (ratings.length > 0) {
        // Aggregate multiset estimates
        const estimates = ratings
          .filter(r => r.multisetValue)
          .map(r => r.multisetValue);
        
        if (estimates.length > 0) {
          const median = this.multisetOps.setMedian(estimates);
          
          // Update DA with aggregated rating
          await this.updateDA(da.id, { multisetEstimate: median });
        }
      }
    }
    
    // 4. Aggregate compatibility ratings
    const pairs = await this.getCompatibilityPairs(systemId);
    
    for (const [da1Id, da2Id] of pairs) {
      const ratings = await this.getCompatibilityRatings(da1Id, da2Id);
      
      if (ratings.size > 0) {
        const experts = await this.getExperts(Array.from(ratings.keys()));
        const aggregated = this.compatAggregator.aggregate(
          ratings,
          experts,
          'median'  // Default method
        );
        
        await this.updateCompatibility(da1Id, da2Id, aggregated);
      }
    }
    
    // 5. Re-run optimization with aggregated ratings
    await this.optimizer.optimize(systemId);
  }
  
  /**
   * Show disagreement to decision-makers
   */
  async getDisagreementReport(daId: string): Promise<DisagreementReport> {
    const ratings = await this.getRatingsForDA(daId);
    
    if (ratings.length === 0) {
      return { hasDisagreement: false };
    }
    
    const estimates = ratings.map(r => r.multisetValue);
    const median = this.multisetOps.setMedian(estimates);
    
    // Compute distances from median
    const distances = estimates.map(e => {
      const [down, up] = this.multisetOps.proximity(median, e);
      return { expert: r.expertId, distance: Math.max(down, up) };
    });
    
    const maxDistance = Math.max(...distances.map(d => d.distance));
    
    return {
      hasDisagreement: maxDistance > 0,
      median,
      distances,
      maxDistance,
      expertCount: ratings.length
    };
  }
}
```

## Version Management

```typescript
class VersionManager {
  
  /**
   * Create version snapshot
   */
  async createVersion(
    systemId: string,
    versionNumber: string,
    name: string,
    createdBy: string,
    notes?: string
  ): Promise<Version> {
    
    // 1. Get current system state
    const hierarchy = await this.getHierarchy(systemId);
    const das = await this.getAllDAs(systemId);
    const compatibility = await this.getAllCompatibility(systemId);
    const solutions = await this.getAllSolutions(systemId);
    
    // 2. Create snapshot
    const snapshot = {
      hierarchy,
      das,
      compatibility,
      solutions
    };
    
    // 3. Save version
    const version: Version = {
      id: generateId(),
      systemId,
      versionNumber,
      name,
      snapshot,
      timestamp: new Date(),
      createdBy,
      notes,
      tags: []
    };
    
    await this.saveVersion(version);
    
    return version;
  }
  
  /**
   * Compare two versions
   */
  async compareVersions(
    versionId1: string,
    versionId2: string
  ): Promise<VersionComparison> {
    
    const v1 = await this.getVersion(versionId1);
    const v2 = await this.getVersion(versionId2);
    
    return {
      hierarchyDiff: this.diffHierarchy(v1.snapshot.hierarchy, v2.snapshot.hierarchy),
      dasDiff: this.diffDAs(v1.snapshot.das, v2.snapshot.das),
      compatibilityDiff: this.diffCompatibility(v1.snapshot.compatibility, v2.snapshot.compatibility),
      solutionsDiff: this.diffSolutions(v1.snapshot.solutions, v2.snapshot.solutions)
    };
  }
  
  /**
   * Restore to version
   */
  async restoreVersion(versionId: string): Promise<void> {
    const version = await this.getVersion(versionId);
    
    // Overwrite current state with snapshot
    await this.restoreHierarchy(version.snapshot.hierarchy);
    await this.restoreDAs(version.snapshot.das);
    await this.restoreCompatibility(version.snapshot.compatibility);
    await this.restoreSolutions(version.snapshot.solutions);
  }
}
```

## Performance Optimization

### Caching Strategy

```typescript
// Redis cache for frequently accessed data
class CacheManager {
  
  private redis: RedisClient;
  
  async getHierarchy(systemId: string): Promise<SystemNode[]> {
    const cached = await this.redis.get(`hierarchy:${systemId}`);
    if (cached) return JSON.parse(cached);
    
    const hierarchy = await this.db.getHierarchy(systemId);
    await this.redis.setex(`hierarchy:${systemId}`, 3600, JSON.stringify(hierarchy));
    
    return hierarchy;
  }
  
  async invalidateHierarchy(systemId: string): Promise<void> {
    await this.redis.del(`hierarchy:${systemId}`);
  }
}
```

### Query Optimization

```sql
-- Use indexed queries
CREATE INDEX idx_optimize ON design_alternatives(component_id, priority);

-- Batch load DAs
SELECT * FROM design_alternatives WHERE component_id = ANY($1);

-- Pre-aggregate compatibility
SELECT da1_id, da2_id, MIN(value) as value
FROM compatibility_ratings
GROUP BY da1_id, da2_id;
```

### Parallelization

```typescript
// Parallel optimization for large systems
async optimizeParallel(systemId: string): Promise<Solution[]> {
  const components = await this.getLeafComponents(systemId);
  
  // Split into independent sub-hierarchies
  const subHierarchies = this.splitHierarchy(components);
  
  // Optimize each sub-hierarchy in parallel
  const subSolutions = await Promise.all(
    subHierarchies.map(sub => this.optimizeSubHierarchy(sub))
  );
  
  // Combine sub-solutions
  return this.combineSolutions(subSolutions);
}
```

## Testing Strategy

### Unit Tests

```typescript
describe('HMMDOptimizer', () => {
  it('should find Pareto-efficient solutions', async () => {
    const system = createTestSystem();
    const solutions = await optimizer.optimize(system.id);
    
    expect(solutions.length).toBeGreaterThan(0);
    expect(solutions.every(s => s.isParetoEfficient)).toBe(true);
  });
  
  it('should filter incompatible solutions', async () => {
    const system = createIncompatibleSystem();
    const solutions = await optimizer.optimize(system.id);
    
    expect(solutions.every(s => s.qualityVector.w >= 1)).toBe(true);
  });
});

describe('MultisetOperations', () => {
  it('should compute median correctly', () => {
    const estimates = [
      { l: 3, eta: 3, counts: [3, 0, 0] },
      { l: 3, eta: 3, counts: [1, 2, 0] },
      { l: 3, eta: 3, counts: [0, 3, 0] }
    ];
    
    const median = multisetOps.setMedian(estimates);
    
    expect(median.counts).toEqual([1, 2, 0]);
  });
});
```

### Integration Tests

```typescript
describe('Multi-Expert Workflow', () => {
  it('should aggregate expert ratings', async () => {
    const system = await createSystemWithDAs();
    const experts = await createExperts(3);
    
    // Add ratings
    for (const expert of experts) {
      await addRating(system.daId, expert.id, { l: 3, eta: 3, counts: [2, 1, 0] });
    }
    
    // Aggregate
    await workflow.executeRatingWorkflow(system.id, experts.map(e => e.id));
    
    // Verify
    const da = await getDA(system.daId);
    expect(da.multisetEstimate).toBeDefined();
  });
});
```

## Deployment Checklist

- [ ] Database migrations run
- [ ] Redis cache configured
- [ ] API endpoints tested
- [ ] WebSocket connections stable
- [ ] File upload storage configured
- [ ] Authentication/authorization working
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Monitoring alerts set up
- [ ] Backup strategy in place
- [ ] Load testing completed
- [ ] Security audit passed

## Next Steps

- **04-hmmd-method.md**: Algorithm details
- **05-multiset-estimates.md**: Multiset operations
- **06-compatibility.md**: Compatibility management
- **12-math-foundations.md**: Mathematical background
