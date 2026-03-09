# Core Concepts

## System Hierarchy

A **modular system** is decomposed into a tree-like structure:
- **System**: Top-level entity being designed
- **Subsystems**: Major components (e.g., Switching SubSystem, Base Station SubSystem)
- **Modules**: Sub-components within subsystems
- **Components**: Leaf nodes that have concrete alternatives

Example: GSM Network
```
GSM Network
├── SSS (Switching SubSystem)
│   ├── MSC/VLR
│   └── HLR/AC
└── BSS (Base Station SubSystem)
    ├── BSC
    ├── BTS
    └── TRx
```

## Design Alternatives (DAs)

A **Design Alternative (DA)** is a concrete option for a system component.

**Example**: For component MSC/VLR, DAs might be:
- M₁: Motorola MSC
- M₂: Alcatel MSC
- M₃: Huawei MSC
- M₄: Siemens MSC
- M₅: Ericsson MSC

**Notation**: Xᵢ denotes DA i for component X

## Composite Design Alternative

A **composite DA** (or **solution**) is a complete system configuration formed by selecting one DA for each component:

S = X ⋆ Y ⋆ Z

where ⋆ denotes composition, and X, Y, Z are the selected DAs.

**Example**: S = M₄ ⋆ L₂ ⋆ V₅ ⋆ U₁ ⋆ T₅

This means: Siemens MSC, Ericsson HLR, Nokia BSC, Motorola BTS, Siemens TRx

## Quality Ratings (Priorities)

Each DA has a **quality rating** or **priority** on an ordinal scale [1, 2, ..., l].

- **1** = Best quality
- **2** = Second best
- **l** = Worst quality

**Example**:
- M₄ has priority 1 (best)
- M₁ has priority 2
- M₅ has priority 2
- M₂ has priority 3
- M₃ has priority 3

**Multi-Expert**: Different experts may assign different priorities. See **05-multiset-estimates.md** for aggregation.

## Compatibility

**Compatibility** measures how well two DAs work together.

### Binary Scale
- **0** = Incompatible (cannot be used together)
- **1** = Compatible

### Ordinal Scale (More Informative)
- **0** = Incompatible
- **1** = Poor compatibility
- **2** = Moderate compatibility
- **3** = Good compatibility
- **ν** = Excellent compatibility (highest value)

**Properties**:
- Symmetric: comp(Xᵢ, Yⱼ) = comp(Yⱼ, Xᵢ)
- Only between DAs of **different components** (never within same component)

**Example**:
```
     L₁  L₂  L₃  L₄
M₁    0   0   0   0
M₂    0   0   1   0
M₃    0   0   0   0
M₄    3   2   0   1
M₅    1   0   0   3
```

**Multi-Expert**: Different experts may rate compatibility differently. See **06-compatibility.md** for aggregation.

## System Quality Vector

A composite solution S has a **quality vector**:

**N(S) = (w(S); e(S))**

### Component 1: w(S) - Compatibility Quality

**w(S)** = minimum pairwise compatibility in solution S

**Formula**: w(S) = min{comp(DAᵢ, DAⱼ) | DAᵢ and DAⱼ are in S, from different components}

**Interpretation**: The "weakest link" in terms of compatibility

**Example**: 
- S = M₄ ⋆ L₂ ⋆ V₅
- comp(M₄, L₂) = 2
- comp(M₄, V₅) = 3
- comp(L₂, V₅) = 3
- **w(S) = min(2, 3, 3) = 2**

### Component 2: e(S) - Element Quality

**e(S)** = (η₁, η₂, ..., ηₗ) where ηᵢ = number of DAs with priority i

**Constraint**: Σηᵢ = m (total number of components)

**Interpretation**: Distribution of component qualities

**Example**:
- S = M₄ ⋆ L₂ ⋆ V₅ (m=3 components)
- M₄ has priority 1
- L₂ has priority 1
- V₅ has priority 1
- **e(S) = (3, 0, 0)** means: 3 components at priority 1, 0 at priority 2, 0 at priority 3

**Better solutions have**: More components at priority 1 (higher η₁)

## Pareto Efficiency

A solution S₁ **Pareto-dominates** S₂ if:
- S₁ is at least as good as S₂ on all objectives, AND
- S₁ is strictly better than S₂ on at least one objective

**For N(S) = (w(S); e(S))**:
- S₁ dominates S₂ if: w(S₁) ≥ w(S₂) AND e(S₁) ≥ e(S₂) (in poset ordering)
- AND at least one inequality is strict

**Pareto-efficient solution**: Not dominated by any other solution

**Pareto frontier**: Set of all Pareto-efficient solutions

**Why Pareto?**: No single "best" solution exists when objectives conflict (compatibility vs. component quality). Pareto-efficient solutions represent the best trade-offs.

**Example**:
- S₁: N(S₁) = (1; 2, 1, 0) - Great components, poor compatibility
- S₂: N(S₂) = (2; 1, 2, 0) - Good components, moderate compatibility
- S₃: N(S₃) = (3; 0, 2, 1) - Moderate components, excellent compatibility

All three might be Pareto-efficient (none dominates another).

## Multi-Expert Ratings

**Problem**: Different experts have different opinions

**Approach**: 
1. Each expert provides ratings independently
2. **Aggregate** ratings using mathematical operations
3. Show **disagreement** to decision-makers

### Aggregation Methods

**For DA Quality**:
- **Median**: Find "middle" opinion
- **Integration**: Sum multiset estimates (see **05-multiset-estimates.md**)

**For Compatibility**:
- **Minimum**: Conservative approach (worst-case)
- **Median**: Middle ground
- **Weighted average**: Account for expert reliability

**For Solutions**:
- **Consensus**: Find common elements across expert-preferred solutions
- **Voting**: Each expert votes, select most popular

See **10-aggregation.md** for details.

## System Life Cycle

Systems evolve through stages:

1. **Conceptual Design**: Define hierarchy and requirements
2. **System Design**: Select DAs → HMMD optimization
3. **Evaluation**: Assess quality of designed system
4. **Bottleneck Detection**: Find weak points
5. **Improvement/Redesign**: Upgrade components
6. **Evolution**: Track changes over generations
7. **Forecasting**: Predict future improvements

This system supports stages 2-7 with mathematical rigor.

## Morphological Clique Problem

The core optimization problem:

**Given**:
- System hierarchy with m components
- Set of DAs for each component
- Quality ratings for each DA
- Compatibility ratings between DAs

**Find**: Composite solutions S that are Pareto-efficient

**Constraint**: w(S) ≥ 1 (all components must be compatible)

**Objectives**:
- Maximize w(S) (compatibility quality)
- Maximize e(S) (component quality)

**Complexity**: NP-hard (exponential in m)

**Solving**: Enumerate admissible combinations → Filter Pareto-efficient

See **04-hmmd-method.md** for detailed algorithm.

## Key Terminology Summary

| Term | Definition | Example |
|------|------------|---------|
| **System** | Top-level entity | GSM Network |
| **Component** | Leaf node in hierarchy | MSC/VLR |
| **DA** | Design Alternative | M₄ (Siemens MSC) |
| **Composite DA** | Complete configuration | M₄ ⋆ L₂ ⋆ V₅ |
| **Priority** | Quality rating (ordinal) | 1=best, 2=good, 3=moderate |
| **Compatibility** | Inter-component fit | comp(M₄, L₂)=3 |
| **w(S)** | Min pairwise compatibility | w(S)=2 |
| **e(S)** | Quality distribution | e(S)=(3,0,0) |
| **N(S)** | Quality vector | N(S)=(2; 3,0,0) |
| **Pareto-efficient** | Non-dominated solution | Best trade-off |

## Next Steps

- **02-hierarchical-structures.md**: Types of hierarchies
- **04-hmmd-method.md**: How to solve the optimization
- **05-multiset-estimates.md**: Advanced quality representation
- **12-math-foundations.md**: Mathematical rigor
