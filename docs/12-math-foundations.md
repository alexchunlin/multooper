# Mathematical Foundations

This document provides rigorous mathematical treatment of core concepts.

## Partially Ordered Sets (Posets)

### Definition

A **partially ordered set** (poset) is a set P with a binary relation ≤ satisfying:

1. **Reflexivity**: a ≤ a
2. **Antisymmetry**: a ≤ b and b ≤ a implies a = b
3. **Transitivity**: a ≤ b and b ≤ c implies a ≤ c

**Partial**: Not all elements are comparable (unlike total order)

**Example**: Quality vectors N(S) = (w; e) form a poset

### Comparability

Two elements a, b ∈ P are **comparable** if a ≤ b or b ≤ a

Two elements are **incomparable** if neither a ≤ b nor b ≤ a (denoted a || b)

**Example**:
```
N(S₁) = (2; 2,1,0)
N(S₂) = (3; 0,2,1)

S₁ || S₂ (incomparable)
- S₁ has better e(S)
- S₂ has better w(S)
```

### Hasse Diagrams

Visual representation of poset:
- Nodes = elements
- Edges = cover relations (a < b with no c such that a < c < b)
- Higher nodes = "better" elements

**Example** (3 components, 3 quality levels):

```
      (3,0,0)  ← ideal point
       / | \
   (2,1,0) (1,2,0) (0,3,0)
    / |  \   / |  \   / |
(2,0,1)(1,1,1)(1,0,2)(0,2,1)(0,1,2)
       \   |   /    \  |  /
        (0,0,3)  ← worst point
```

Reading: (2,1,0) is better than (2,0,1) and (1,1,1)

### Lattices

A **lattice** is a poset where every two elements have:
- **Meet** (∧): Greatest lower bound
- **Join** (∨): Least upper bound

**Example**: For quality vectors
```
(2,1,0) ∧ (1,2,0) = (1,1,0)  [meet: worse on both dimensions]
(2,1,0) ∨ (1,2,0) = (2,2,0)  [join: better on both dimensions]
```

**Not a lattice**: Quality space with w(S) dimension
- (2; 2,1,0) and (3; 0,2,1) have no join (can't be better on both w and e)

### Chains and Antichains

**Chain**: Totally ordered subset (all comparable)

**Antichain**: Subset where no two elements are comparable

**Example**:
```
Chain: (3,0,0) < (2,1,0) < (1,2,0) < (0,3,0)

Antichain: {(2,0,1), (1,1,1), (0,2,1)} (all incomparable)
```

**Dilworth's Theorem**: In any finite poset, maximum antichain size = minimum number of chains needed to cover the set

## Pareto Efficiency

### Multi-Objective Optimization

**Problem**: Minimize f₁(x), f₂(x), ..., fₖ(x) subject to x ∈ X

**Conflict**: Improving one objective may worsen another

### Pareto Dominance

Solution x₁ **Pareto dominates** x₂ (denoted x₁ ≺ x₂) if:
- fᵢ(x₁) ≤ fᵢ(x₂) for all i ∈ {1, ..., k}  (at least as good on all objectives)
- fⱼ(x₁) < fⱼ(x₂) for at least one j  (strictly better on at least one)

**Note**: For maximization, reverse inequalities

**Example**:
```
S₁: N(S₁) = (2; 2,1,0)
S₂: N(S₂) = (1; 3,0,0)

Compare:
- w(S₁) = 2 > 1 = w(S₂) ✓
- e(S₁) = (2,1,0) vs e(S₂) = (3,0,0)
  - S₁ has 2 at level 1, S₂ has 3 at level 1
  - S₂ is better on e(S) ✓

Result: Neither dominates (S₁ better on w, S₂ better on e)
```

### Pareto Frontier

**Pareto-efficient** (or **Pareto-optimal**): Solution not dominated by any other feasible solution

**Pareto frontier** (or **Pareto set**): Set of all Pareto-efficient solutions

**Properties**:
1. Always non-empty (if feasible set non-empty)
2. All solutions are incomparable (antichain in poset)
3. Represents best trade-offs

### Finding Pareto Frontier

**Algorithm**:
```
Input: Set of solutions S = {S₁, ..., Sₙ}
Output: Pareto frontier P

P = S
for each Sᵢ ∈ S:
  for each Sⱼ ∈ S, j ≠ i:
    if Sⱼ ≺ Sᵢ:
      remove Sᵢ from P
      break

return P
```

**Complexity**: O(n² × k) where n = #solutions, k = #objectives

### Scalarization Methods

**Weighted sum**: Convert multi-objective to single-objective

**Formula**: min Σ wᵢ fᵢ(x) where Σ wᵢ = 1, wᵢ ≥ 0

**Issue**: Cannot find solutions on non-convex parts of Pareto frontier

**ε-constraint method**: 
- Optimize f₁(x)
- Subject to f₂(x) ≤ ε₂, f₃(x) ≤ ε₃, ...

**Advantage**: Can find any Pareto-efficient solution

### Selection from Pareto Frontier

If multiple Pareto-efficient solutions exist, how to choose?

**Methods**:
1. **Reference point**: Choose closest to ideal point
2. **Knee point**: Choose point of maximum curvature (best compromise)
3. **Weighted sum**: Apply weights post-hoc
4. **Decision maker**: Let human decide based on preferences
5. **Robustness**: Choose solution least sensitive to perturbations

## Multiset Theory

### Multiset Definition

A **multiset** (or **bag**) M over set A is a pair (A, m) where m: A → ℕ₀ gives the multiplicity of each element.

**Notation**: {a, a, b} means a appears twice, b once

**Example**: Multiset estimate e = (3, 1, 0) over quality levels {1, 2, 3}
- Level 1 appears 3 times
- Level 2 appears 1 time
- Level 3 appears 0 times

### Multiset Operations

**Union** (∪): m_{A∪B}(x) = max(m_A(x), m_B(x))

**Intersection** (∩): m_{A∩B}(x) = min(m_A(x), m_B(x))

**Sum** (⊎): m_{A⊎B}(x) = m_A(x) + m_B(x)

**Example**:
```
A = {a, a, b}  → m_A(a)=2, m_A(b)=1
B = {a, b, b}  → m_B(a)=1, m_B(b)=2

A ∪ B = {a, a, b, b}  [max: a appears 2, b appears 2]
A ∩ B = {a, b}        [min: a appears 1, b appears 1]
A ⊎ B = {a, a, a, b, b, b}  [sum: a appears 3, b appears 3]
```

### Multiset Cardinality

|A| = Σ_{x∈U} m_A(x)  (total number of elements, counting duplicates)

**Example**: |{a, a, b}| = 2 + 1 = 3

### Multiset Coefficient

Number of multisets of cardinality k with elements from set of size n:

**Formula**: ((n choose k)) = (n+k-1 choose k) = (n+k-1)! / (k! (n-1)!)

**Example**: 
- Multisets of size 3 from {1, 2, 3}: ((3 choose 3)) = (5 choose 3) = 10
- They are: {1,1,1}, {1,1,2}, {1,1,3}, {1,2,2}, {1,2,3}, {1,3,3}, {2,2,2}, {2,2,3}, {2,3,3}, {3,3,3}

### Interval Multiset Constraint

**Definition**: A multiset is **interval** if its non-zero multiplicities form a contiguous interval

**Example** (n=3, k=3):
- **Interval**: {1,1,2} ✓ (non-zero at levels 1,2 - contiguous)
- **Not interval**: {1,2,3} ✗ (non-zero at all levels - but gap in counts? No, this is interval)
- **Not interval**: {1,3} ✗ (gap: level 2 has 0 elements)

**Number of interval multisets**: Fewer than total multisets

**Why interval?**: Represents coherent assessment (no "holes" in quality distribution)

## Distance and Proximity Metrics

### Ordinal Proximity

For ordinal scales [1, 2, ..., l]:

**Simple distance**: |i - j| (absolute difference in levels)

**Issue**: Ignores order direction

**Vector proximity**: δ(i, j) = (Δ⁻, Δ⁺)
- Δ⁻ = max(0, i - j)  [how much i is worse than j]
- Δ⁺ = max(0, j - i)  [how much i is better than j]

**Example**:
```
δ(1, 3) = (2, 0)  [level 1 is 2 steps worse than level 3]
δ(3, 1) = (0, 2)  [level 3 is 2 steps better than level 1]
δ(2, 2) = (0, 0)  [same level]
```

### Multiset Proximity

For multiset estimates e₁, e₂:

**Cumulative approach**:
```
δ(e₁, e₂) = (Δ⁻, Δ⁺)

where:
Δ⁻ = max_{t=1 to l} (cum_{e₂}(t) - cum_{e₁}(t))
Δ⁺ = max_{t=1 to l} (cum_{e₁}(t) - cum_{e₂}(t))

cum_e(t) = Σ_{i=1}^{t} e[i]  [cumulative count up to level t]
```

**Interpretation**:
- Δ⁻: Maximum "downward shift" needed to go from e₁ to e₂
- Δ⁺: Maximum "upward shift" needed

**Example**:
```
e₁ = (3, 1, 0)  [3 at level 1, 1 at level 2]
e₂ = (1, 2, 1)  [1 at level 1, 2 at level 2, 1 at level 3]

cum_e1 = (3, 4, 4)
cum_e2 = (1, 3, 4)

Δ⁻ = max(1-3, 3-4, 4-4) = max(-2, -1, 0) = 0
Δ⁺ = max(3-1, 4-3, 4-4) = max(2, 1, 0) = 2

δ(e₁, e₂) = (0, 2)

Interpretation: e₂ is worse than e₁ (no improvement, some degradation)
```

**Total distance**: |δ(e₁, e₂)| = max(Δ⁻, Δ⁺)

**Properties**:
- δ(e, e) = (0, 0)
- δ(e₁, e₂) ≠ δ(e₂, e₁) in general (asymmetric)
- |δ(e₁, e₂)| = |δ(e₂, e₁)| (symmetric total)

## Combinatorial Optimization

### Problem Classification

**P**: Problems solvable in polynomial time

**NP**: Problems verifiable in polynomial time

**NP-hard**: At least as hard as any NP problem

**NP-complete**: NP-hard and in NP

### HMMD Complexity

**Problem**: Find Pareto-efficient composite solutions

**Size**: 
- m components
- qᵢ DAs for component i
- Total combinations: Π qᵢ

**Complexity**: NP-hard

**Proof sketch**: Contains maximal clique as subproblem (set compatibility=0/1, find largest compatible set)

### Exact Algorithms

**Brute force**: Enumerate all Π qᵢ combinations
- Time: O(Π qᵢ × m²)
- Space: O(m)

**Branch and bound**:
- Prune branches where partial solution already has w(S) < 1
- Time: Still exponential, but faster in practice

**Dynamic programming** (for special cases):
- If hierarchy is tree (no cross-compatibility between branches)
- Time: O(Σ qᵢ × m)

### Approximation Algorithms

**Greedy**:
1. Select best DA for each component (ignoring compatibility)
2. Repair incompatibilities by swapping DAs
- Time: O(m × max qᵢ)
- Quality: No guarantee

**Local search**:
1. Start with random solution
2. Swap DAs to improve quality
3. Repeat until convergence
- Time: O(iterations × m × max qᵢ)
- Quality: Local optimum

**Genetic algorithms**:
1. Encode solutions as chromosomes
2. Apply crossover, mutation
3. Select based on Pareto dominance
- Time: O(generations × population × m²)
- Quality: Near-optimal for large instances

### Recommendation

**Small systems** (m ≤ 10, qᵢ ≤ 5): Use exact enumeration
**Medium systems** (m ≤ 20, qᵢ ≤ 10): Use branch-and-bound
**Large systems** (m > 20): Use heuristics (genetic, local search)

## Probability and Uncertainty

### Expected Value

For random variable X with outcomes x₁, ..., xₙ and probabilities p₁, ..., pₙ:

E[X] = Σ pᵢ xᵢ

**Example**: If quality rating is uncertain
```
P(priority = 1) = 0.6
P(priority = 2) = 0.3
P(priority = 3) = 0.1

E[priority] = 0.6×1 + 0.3×2 + 0.1×3 = 1.5
```

### Variance

Var(X) = E[(X - E[X])²] = E[X²] - (E[X])²

**Interpretation**: Spread of distribution

**Example**:
```
Var(priority) = (0.6×1² + 0.3×2² + 0.1×3²) - 1.5²
              = (0.6 + 1.2 + 0.9) - 2.25
              = 2.7 - 2.25 = 0.45
```

### Median

**Definition**: Value m such that P(X ≤ m) ≥ 0.5 and P(X ≥ m) ≥ 0.5

**Advantage**: Robust to outliers (unlike mean)

**Example**: {1, 1, 2, 3, 3} → median = 2

### Aggregation Under Uncertainty

**Mean**: E[X₁ + X₂ + ... + Xₙ] = E[X₁] + E[X₂] + ... + E[Xₙ]

**Median of medians**: NOT equal to overall median

**Recommendation**: For multi-expert, compute median of individual estimates (not mean)

## Graph Theory

### Graphs

**Graph**: G = (V, E) where V = vertices, E = edges

**Directed**: Edges have direction (arcs)

**Undirected**: Edges have no direction

**Weighted**: Edges have weights (e.g., compatibility)

### Trees

**Tree**: Connected acyclic graph

**Properties**:
- |E| = |V| - 1
- Unique path between any two vertices
- Removing any edge disconnects the graph

**Rooted tree**: One vertex designated as root, all edges oriented away from root

**Application**: System hierarchy is a rooted tree

### Clique

**Clique**: Complete subgraph (all vertices connected)

**Maximal clique**: Not contained in any larger clique

**Maximum clique**: Largest clique in graph

**Application**: Morphological clique problem (find largest set of mutually compatible DAs)

## Formal Logic

### First-Order Logic

**Predicates**: P(x) means "property P holds for x"

**Quantifiers**:
- ∀x P(x): "For all x, P(x)"
- ∃x P(x): "There exists x such that P(x)"

### Example: HMMD Formalization

**Admissibility**: 
```
admissible(S) ⟺ ∀i,j ∈ components(S), i ≠ j → compatible(S[i], S[j]) > 0
```

**Pareto efficiency**:
```
pareto_efficient(S) ⟺ admissible(S) ∧ ¬∃S' (admissible(S') ∧ S' ≺ S)
```

## Summary of Key Formulas

### Quality Vector
```
N(S) = (w(S); e(S))

w(S) = min{comp(DAᵢ, DAⱼ) | DAᵢ, DAⱼ ∈ S, different components}

e(S) = (η₁, η₂, ..., ηₗ)
ηᵢ = |{DA ∈ S | priority(DA) = i}|
```

### Pareto Dominance
```
S₁ ≺ S₂ ⟺ w(S₁) ≥ w(S₂) ∧ e(S₁) ≥ e(S₂) ∧ (w(S₁) > w(S₂) ∨ e(S₁) > e(S₂))
```

### Multiset Operations
```
e₁ ⊎ e₂ = (e₁[1]+e₂[1], ..., e₁[l]+e₂[l])

δ(e₁, e₂) = (Δ⁻, Δ⁺)
Δ⁻ = max_t (cum_{e₂}(t) - cum_{e₁}(t))
Δ⁺ = max_t (cum_{e₁}(t) - cum_{e₂}(t))
```

### Median
```
M^g = argmin_{M ∈ D} Σ |δ(M, eₖ)|
M^s = argmin_{M ∈ E} Σ |δ(M, eₖ)|
```

where D = all possible estimates, E = given estimates

## Next Steps

- **04-hmmd-method.md**: Apply these concepts to optimization
- **05-multiset-estimates.md**: Detailed multiset operations
- **10-aggregation.md**: Aggregation theory
- **13-implementation-guide.md**: Efficient algorithms
