# HMMD Method (Hierarchical Morphological Multicriteria Design)

**HMMD** is the primary optimization method for this system. It finds Pareto-efficient system configurations by combining top-down hierarchy design with bottom-up optimization.

## Overview

**HMMD** = Hierarchical Morphological Multicriteria Design

**Input**:
- Tree-like system hierarchy
- Design alternatives (DAs) for each leaf node
- Quality ratings (priorities) for DAs
- Compatibility ratings between DAs

**Output**:
- Set of Pareto-efficient composite solutions
- Quality vectors N(S) = (w(S); e(S)) for each solution

**Key Feature**: Handles multiple criteria (compatibility + component quality) via Pareto efficiency

## Four Phases

### Phase 1: Design System Hierarchy

Build tree-like structure:
1. Identify main system
2. Decompose into subsystems
3. Decompose subsystems into modules/components
4. Continue until leaf nodes are reached

**Example**:
```
GSM Network (Level 0)
├── SSS (Level 1)
│   ├── MSC/VLR (Level 2 - leaf)
│   └── HLR/AC (Level 2 - leaf)
└── BSS (Level 1)
    ├── BSC (Level 2 - leaf)
    ├── BTS (Level 2 - leaf)
    └── TRx (Level 2 - leaf)
```

**Methods**: See **02-hierarchical-structures.md**

### Phase 2: Generate Design Alternatives

For each leaf node (component), list concrete options:

**Example for MSC/VLR**:
- M₁: Motorola MSC
- M₂: Alcatel MSC
- M₃: Huawei MSC
- M₄: Siemens MSC
- M₅: Ericsson MSC

**Sources**:
- Vendor catalogs
- Expert knowledge
- Existing systems
- Literature review

### Phase 3: Compose DAs (Morphological Clique Problem)

**Problem**: Select one DA per component to form composite solutions

**Assumptions**:
- Tree-like structure
- Composite quality = component qualities + compatibility
- Monotonic criteria (better components → better system)
- Coordinated ordinal scales

**Quality Vector**: N(S) = (w(S); e(S))

**w(S)**: Minimum pairwise compatibility
```
w(S) = min{comp(DAᵢ, DAⱼ) | DAᵢ, DAⱼ ∈ S, from different components}
```

**e(S)**: Quality distribution
```
e(S) = (η₁, η₂, ..., ηₗ)
ηᵢ = count of DAs with priority i
Σηᵢ = m (total components)
```

**Optimization Problem**:
```
max e(S)  (via poset ordering)
max w(S)
s.t. w(S) ≥ 1  (all components compatible)
```

**Solving Algorithm**:

1. **Enumerate** all combinations: ∏qᵢ combinations (qᵢ = #DAs for component i)
2. **Filter** by compatibility: w(S) ≥ 1
3. **Compute** quality vectors: N(S) = (w(S); e(S))
4. **Select** Pareto-efficient: Remove dominated solutions

**Complexity**: O(∏qᵢ × m²) - exponential in depth, polynomial in width

**Multi-Layer Extension**:
For hierarchical systems, apply HMMD recursively:
1. Solve leaf level → get composite DAs
2. Use composite DAs as inputs to parent level
3. Repeat until root reached

### Phase 4: Analyze and Improve

**Analysis**:
- Compare Pareto-efficient solutions
- Identify bottlenecks (see **08-bottlenecks.md**)
- Evaluate trade-offs

**Improvement**:
- Replace weak DAs
- Add new DAs
- Improve compatibility
- Restructure hierarchy

See **09-improvement.md**

## Detailed Example: 3-Component System

**System**: S = X ⋆ Y ⋆ Z

### Step 1: Define DAs and Priorities

```
X: X₁(2), X₂(1), X₃(1)    (priority in parentheses)
Y: Y₁(3), Y₂(1), Y₃(3), Y₄(3)
Z: Z₁(1), Z₂(1), Z₃(3)
```

### Step 2: Define Compatibility Matrix

|     | Y₁ | Y₂ | Y₃ | Y₄ | Z₁ | Z₂ | Z₃ |
|-----|----|----|----|----|----|----|----| 
| X₁  | 3  | 2  | 0  | 0  | 0  | 2  | 3  |
| X₂  | 0  | 3  | 0  | 0  | 0  | 1  | 0  |
| X₃  | 0  | 0  | 0  | 0  | 0  | 0  | 1  |
| Y₁  | -  | -  | -  | -  | 0  | 0  | 3  |
| Y₂  | -  | -  | -  | -  | 0  | 2  | 0  |

Note: 0 = incompatible, 1-3 = compatible (higher = better)

### Step 3: Enumerate and Evaluate

Total combinations: 3 × 4 × 3 = 36

**Example solutions**:

**S₁ = X₂ ⋆ Y₂ ⋆ Z₂**
- Priorities: X₂(1), Y₂(1), Z₂(1)
- e(S₁) = (3, 0, 0) [all priority 1]
- Compatibilities: comp(X₂,Y₂)=3, comp(X₂,Z₂)=1, comp(Y₂,Z₂)=2
- w(S₁) = min(3, 1, 2) = 1
- **N(S₁) = (1; 3, 0, 0)**

**S₂ = X₁ ⋆ Y₂ ⋆ Z₂**
- Priorities: X₁(2), Y₂(1), Z₂(1)
- e(S₂) = (2, 1, 0) [two at priority 1, one at priority 2]
- Compatibilities: comp(X₁,Y₂)=2, comp(X₁,Z₂)=2, comp(Y₂,Z₂)=2
- w(S₂) = min(2, 2, 2) = 2
- **N(S₂) = (2; 2, 1, 0)**

**S₃ = X₁ ⋆ Y₁ ⋆ Z₃**
- Priorities: X₁(2), Y₁(3), Z₃(3)
- e(S₃) = (0, 1, 2) [none at priority 1, one at priority 2, two at priority 3]
- Compatibilities: comp(X₁,Y₁)=3, comp(X₁,Z₃)=3, comp(Y₁,Z₃)=3
- w(S₃) = min(3, 3, 3) = 3
- **N(S₃) = (3; 0, 1, 2)**

### Step 4: Pareto-Efficient Selection

Compare quality vectors:
- S₁: N(S₁) = (1; 3, 0, 0)
- S₂: N(S₂) = (2; 2, 1, 0)
- S₃: N(S₃) = (3; 0, 1, 2)

**Dominance Analysis**:
- S₁ vs S₂: S₁ has better e(S), S₂ has better w(S) → **Neither dominates**
- S₁ vs S₃: S₁ has better e(S), S₃ has better w(S) → **Neither dominates**
- S₂ vs S₃: S₂ has better e(S), S₃ has better w(S) → **Neither dominates**

**Result**: All three are Pareto-efficient!

**Interpretation**:
- S₁: Best components, weakest compatibility
- S₂: Balanced components and compatibility
- S₃: Weakest components, strongest compatibility

Decision-maker chooses based on preferences.

## Quality Space (Poset)

The quality vectors form a **partially ordered set (poset)**:

**Ordering**: N(S₁) ≥ N(S₂) if w(S₁) ≥ w(S₂) AND e(S₁) ≥ e(S₂)

**Visualization**: Lattice diagram showing dominance relationships

**Example for 3 components, 3 quality levels**:

```
w=1 lattice:
(3,0,0) ← best e(S)
  ↓
(2,1,0)
 ↙ ↘
(2,0,1) (1,2,0)
  ↓   ↘
(1,1,1) (0,3,0)
  ↓     ↓
(1,0,2) (0,2,1)
  ↘   ↙
  (0,1,2)
    ↓
  (0,0,3) ← worst e(S)
```

Similar lattices exist for w=2, w=3, etc.

**Pareto frontier**: Points not dominated by any other point

See **12-math-foundations.md** for poset theory.

## Multi-Expert Extension

When multiple experts provide ratings:

### Approach 1: Aggregate Ratings First
1. Each expert rates DAs → Aggregate via median
2. Each expert rates compatibility → Aggregate via median or min
3. Run HMMD with aggregated ratings

### Approach 2: Run HMMD Per Expert
1. Run HMMD for each expert's ratings separately
2. Get Pareto-efficient solutions per expert
3. Aggregate solutions via consensus or voting

### Approach 3: Multi-Objective with Expert Disagreement
1. Add "expert disagreement" as additional objective
2. Find Pareto-efficient solutions that minimize disagreement
3. See **10-aggregation.md**

**Recommended**: Approach 1 for simplicity, Approach 2 for transparency

## Modified HMMD with Multiset Estimates

**Enhancement**: Use multiset estimates instead of ordinal priorities

**Quality Vector**: N(S) = (w(S); e(S))

**e(S)**: Aggregated multiset estimate of component DAs

**Method**: 
1. Each DA has multiset estimate: e(Xᵢ) = (η₁, ..., ηₗ)
2. Aggregate selected DAs: e(S) = median{e(DA₁), ..., e(DAₘ)}
3. Optimize for Pareto-efficient N(S)

**Advantage**: Captures uncertainty and expert disagreement better

See **05-multiset-estimates.md**

## Implementation Notes

### Data Structures
```
System = {
  hierarchy: Tree<Node>,
  components: List<Component>,
  DAs: Map<ComponentID, List<DA>>,
  priorities: Map<DA_ID, Priority>,
  compatibility: Matrix<DA_ID, DA_ID, Compatibility>
}

Solution = {
  selected_DAs: Map<ComponentID, DA_ID>,
  quality_vector: (w, e)
}
```

### Algorithm Pseudocode
```
function HMMD(system):
  solutions = []
  
  // Enumerate all combinations
  for each combination C in cartesian_product(system.DAs):
    S = build_solution(C)
    
    // Check compatibility
    w = compute_min_compatibility(S)
    if w < 1:
      continue  // Incompatible, skip
    
    // Compute quality
    e = compute_quality_distribution(S)
    S.quality_vector = (w, e)
    
    solutions.append(S)
  
  // Select Pareto-efficient
  pareto = []
  for S in solutions:
    if not is_dominated(S, solutions):
      pareto.append(S)
  
  return pareto
```

### Optimization Opportunities

**Pruning**: 
- If partial combination already has w < 1, skip all completions
- Use branch-and-bound

**Heuristics**:
- Start with high-priority DAs
- Use greedy approximation for large problems

**Parallelization**:
- Enumerate combinations in parallel
- Distributed computing for large hierarchies

## Comparison to Other Methods

| Method | DA Rating | Compatibility | Quality | Multi-Expert |
|--------|-----------|---------------|---------|--------------|
| Basic MA | None | Binary {0,1} | Admissibility | No |
| Ideal Point | None | Binary {0,1} | Distance to ideal | No |
| Pareto MA | None | Binary {0,1} | Multi-criteria | Possible |
| Multiple Choice | Quantitative | None | Additive | Possible |
| **HMMD** | **Ordinal** | **Ordinal** | **Poset-based** | **Yes** |
| **HMMD+Multiset** | **Multiset** | **Ordinal** | **Poset-based** | **Yes** |

**HMMD advantages**:
- Handles ordinal scales (realistic for expert judgment)
- Considers compatibility explicitly
- Finds multiple Pareto-efficient solutions
- Supports multi-expert aggregation
- Hierarchical (scales to large systems)

## Common Pitfalls

1. **Incompatible hierarchy**: Components interact but not modeled → Add compatibility edges
2. **Too many DAs**: Exponential explosion → Prune low-quality DAs first
3. **No Pareto solutions**: All combinations incompatible → Relax compatibility threshold
4. **Too many Pareto solutions**: Weak dominance → Use stricter criteria or reference points
5. **Expert disagreement ignored**: Single aggregate hides conflict → Show disagreement range

## Next Steps

- **05-multiset-estimates.md**: Advanced quality representation
- **06-compatibility.md**: Detailed compatibility modeling
- **07-system-evaluation.md**: Evaluate designed systems
- **08-bottlenecks.md**: Find weak points
- **10-aggregation.md**: Multi-expert methods
- **12-math-foundations.md**: Mathematical rigor
- **13-implementation-guide.md**: Code implementation
