# Compatibility Matrices

**Compatibility** measures how well two design alternatives (DAs) from different components work together.

## Why Compatibility Matters

**Problem**: Best individual components may not work well together

**Example**:
- M₄ (Siemens MSC) is highest quality
- L₂ (Ericsson HLR) is highest quality
- But M₄ and L₂ have poor interface compatibility!

**Solution**: Model compatibility explicitly, optimize for both individual quality AND compatibility

## Types of Compatibility Scales

### Binary Scale {0, 1}

**Values**:
- **0**: Incompatible (cannot be used together)
- **1**: Compatible (can be used together)

**Use case**: Simple pass/fail, no degrees of compatibility

**Example**:
```
     L₁  L₂
M₁    0   1  (M₁ works with L₂, not L₁)
M₂    1   0  (M₂ works with L₁, not L₂)
```

### Ordinal Scale {0, 1, 2, ..., ν}

**Values**:
- **0**: Incompatible
- **1**: Poor compatibility (technically works, but problems likely)
- **2**: Moderate compatibility
- **3**: Good compatibility
- **ν**: Excellent compatibility (highest value, ν often = 3 or 5)

**Use case**: Degrees of compatibility matter

**Example** (scale {0, 1, 2, 3}):
```
     L₁  L₂  L₃
M₁    0   2   3  (M₁ incompatible with L₁, moderate with L₂, excellent with L₃)
M₂    3   1   0
M₃    0   0   1
```

## Compatibility Matrix Structure

### Symmetric Property

**Key assumption**: comp(Xᵢ, Yⱼ) = comp(Yⱼ, Xᵢ)

**Rationale**: Compatibility is mutual (interface works both ways)

**Implication**: Only need to store upper/lower triangle

### Full Matrix Example

**System**: S = X ⋆ Y ⋆ Z

**Components**: X (3 DAs), Y (4 DAs), Z (2 DAs)

**Compatibility matrix**:

```
     Y₁  Y₂  Y₃  Y₄  Z₁  Z₂
X₁    3   2   0   0   0   2
X₂    0   3   0   0   0   1
X₃    0   0   0   0   0   1
Y₁    -   -   -   -   0   0
Y₂    -   -   -   -   0   2
Y₃    -   -   -   -   0   0
Y₄    -   -   -   -   0   0
```

Notes:
- Diagonal is empty (compatibility only between different components)
- Lower triangle omitted (symmetric)
- Z₁-Z₂ not shown (same component, no compatibility)

### Sparse Representation

For large systems, most pairs are incompatible (0). Store only non-zero:

```typescript
interface CompatibilityMatrix {
  // Map: "X1,Y2" -> 3
  entries: Map<string, number>;
  
  // Quick lookup: comp(X1, Y2)
  get(da1: string, da2: string): number {
    const key = da1 < da2 ? `${da1},${da2}` : `${da2},${da1}`;
    return this.entries.get(key) || 0;
  }
}
```

## Compatibility in HMMD

### System Compatibility w(S)

**Definition**: Minimum pairwise compatibility in solution S

**Formula**: 
```
w(S) = min{comp(DAᵢ, DAⱼ) | DAᵢ, DAⱼ ∈ S, from different components}
```

**Interpretation**: "Weakest link" in compatibility chain

**Example**:
```
S = X₁ ⋆ Y₂ ⋆ Z₂

Pairwise compatibilities:
- comp(X₁, Y₂) = 2
- comp(X₁, Z₂) = 2
- comp(Y₂, Z₂) = 2

w(S) = min(2, 2, 2) = 2
```

### Admissibility Constraint

**Constraint**: w(S) ≥ 1

**Meaning**: All selected DAs must be at least minimally compatible

**Binary scale**: w(S) ≥ 1 means all pairs compatible (no zeros)

**Ordinal scale**: w(S) ≥ 1 allows poor compatibility, w(S) ≥ 3 requires good compatibility

### Computing w(S)

**Algorithm**:
```typescript
function computeSystemCompatibility(S: Solution): number {
  let minComp = Infinity;
  const das = Array.from(S.selectedDAs.values());
  
  for (let i = 0; i < das.length; i++) {
    for (let j = i+1; j < das.length; j++) {
      const comp = compatibility.get(das[i], das[j]);
      minComp = Math.min(minComp, comp);
    }
  }
  
  return minComp;
}
```

**Complexity**: O(m²) where m = number of components

**Optimization**: Early exit if minComp reaches 0

## Multi-Expert Compatibility

**Problem**: Different experts rate compatibility differently

### Expert 1 (Optimist)
```
     L₁  L₂
M₁    3   2
M₂    2   3
```

### Expert 2 (Pessimist)
```
     L₁  L₂
M₁    1   1
M₂    1   2
```

### Expert 3 (Neutral)
```
     L₁  L₂
M₁    2   2
M₂    2   2
```

### Aggregation Methods

#### Method 1: Minimum (Conservative)
```
comp(M₁, L₁) = min(3, 1, 2) = 1
comp(M₁, L₂) = min(2, 1, 2) = 1
comp(M₂, L₁) = min(2, 1, 2) = 1
comp(M₂, L₂) = min(3, 2, 2) = 2
```

**Rationale**: Worst-case scenario, risk-averse

**Use case**: Safety-critical systems

#### Method 2: Median (Balanced)
```
comp(M₁, L₁) = median(3, 1, 2) = 2
comp(M₁, L₂) = median(2, 1, 2) = 2
comp(M₂, L₁) = median(2, 1, 2) = 2
comp(M₂, L₂) = median(3, 2, 2) = 2
```

**Rationale**: Middle ground, ignores extremes

**Use case**: General systems

#### Method 3: Average + Round (Democratic)
```
comp(M₁, L₁) = round((3+1+2)/3) = round(2.0) = 2
comp(M₁, L₂) = round((2+1+2)/3) = round(1.67) = 2
comp(M₂, L₁) = round((2+1+2)/3) = round(1.67) = 2
comp(M₂, L₂) = round((3+2+2)/3) = round(2.33) = 2
```

**Rationale**: Equal weight to all opinions

**Use case**: No expert hierarchy

#### Method 4: Weighted Average (Expertise-Based)
```
Weights: Expert 1 = 0.5, Expert 2 = 0.3, Expert 3 = 0.2

comp(M₁, L₁) = round(0.5*3 + 0.3*1 + 0.2*2) = round(2.0) = 2
comp(M₁, L₂) = round(0.5*2 + 0.3*1 + 0.2*2) = round(1.7) = 2
comp(M₂, L₁) = round(0.5*2 + 0.3*1 + 0.2*2) = round(1.7) = 2
comp(M₂, L₂) = round(0.5*3 + 0.3*2 + 0.2*2) = round(2.5) = 3
```

**Rationale**: Trust experts based on track record

**Use case**: Known expert reliabilities

### Recommendation

**Default**: Use **median** (balanced, robust to outliers)

**Conservative**: Use **minimum** (risk-averse)

**Expert-weighted**: Use **weighted average** if expert reliabilities known

### Implementation

```typescript
function aggregateCompatibility(
  expertMatrices: Map<string, CompatibilityMatrix>,
  experts: Expert[],
  method: 'min' | 'median' | 'average' | 'weighted'
): CompatibilityMatrix {
  const result = new CompatibilityMatrix();
  
  // Get all DA pairs
  const pairs = getAllPairs(expertMatrices);
  
  for (const [da1, da2] of pairs) {
    const ratings = [];
    
    for (const expert of experts) {
      const matrix = expertMatrices.get(expert.id);
      ratings.push(matrix.get(da1, da2));
    }
    
    let aggregated: number;
    switch (method) {
      case 'min':
        aggregated = Math.min(...ratings);
        break;
      case 'median':
        aggregated = median(ratings);
        break;
      case 'average':
        aggregated = Math.round(average(ratings));
        break;
      case 'weighted':
        aggregated = Math.round(
          ratings.reduce((sum, r, i) => sum + r * experts[i].weight, 0)
        );
        break;
    }
    
    result.set(da1, da2, aggregated);
  }
  
  return result;
}
```

## Compatibility Assessment Methods

### 1. Expert Judgment

**Process**:
1. Present DA pairs to domain expert(s)
2. Expert rates compatibility on ordinal scale
3. Aggregate if multiple experts

**Pros**: Captures tacit knowledge, flexible
**Cons**: Subjective, time-consuming for many pairs

**Best for**: Small systems, expert availability

### 2. Technical Testing

**Process**:
1. Physically/virtually test DA combinations
2. Measure interface performance
3. Map performance to ordinal scale

**Pros**: Objective, data-driven
**Cons**: Expensive, requires prototypes

**Best for**: Hardware systems, critical interfaces

### 3. Historical Data

**Process**:
1. Analyze past projects with same/similar DAs
2. Extract compatibility from success/failure rates
3. Infer compatibility ratings

**Pros**: Empirical, scalable
**Cons**: Needs historical database, may not cover all pairs

**Best for**: Established domains, many past projects

### 4. Rule-Based

**Process**:
1. Define compatibility rules (e.g., "same vendor → +1")
2. Apply rules to DA pairs
3. Compute aggregate score

**Pros**: Transparent, fast
**Cons**: Oversimplified, misses nuances

**Best for**: Quick estimates, many DAs

### 5. Hybrid

**Process**:
1. Use rule-based for initial estimates
2. Expert judgment for critical pairs
3. Testing for high-risk interfaces
4. Historical data for validation

**Pros**: Comprehensive, balanced
**Cons**: Complex workflow

**Best for**: Large, complex systems

## Visualization

### Heatmap

```
     L₁  L₂  L₃  L₄
M₁   ■■■ ■■ ░░░ ░░░
M₂   ░░░ ■■■ ░░░ ■■
M₃   ░░░ ░░░ ░░░ ░
```

Legend:
- ■■■ = 3 (excellent)
- ■■ = 2 (good)
- ■ = 1 (poor)
- ░░░ = 0 (incompatible)

**Use**: Quick overview of compatibility landscape

### Graph View

Nodes = DAs
Edges = Compatibility (thickness = rating, color = level)

```
M₁ ──── L₂
  ╲     
   ╲── L₃
```

**Use**: Identify clusters, isolated DAs

## Special Cases

### Universal Compatibility

Some DAs work with everything:
```
comp(Xᵢ, Yⱼ) = ν (max) for all j
```

**Implication**: Can use Xᵢ with any Yⱼ

**Use case**: Standard interfaces, adapters

### Universal Incompatibility

Some DAs work with nothing:
```
comp(Xᵢ, Yⱼ) = 0 for all j
```

**Implication**: Xᵢ cannot be in any solution → Remove Xᵢ

**Detection**: If all zeros, DA is useless

### Selective Compatibility

Some DAs only work with specific partners:
```
comp(X₁, Y₁) = 3
comp(X₁, Yⱼ) = 0 for j ≠ 1
```

**Implication**: If X₁ selected, must select Y₁

**Use case**: Vendor lock-in, proprietary interfaces

## Compatibility vs. Quality Trade-off

**Scenario**:
- DA X₁: Quality 1 (best), but poor compatibility
- DA X₂: Quality 2, but excellent compatibility

**Example**:
```
Solution A: X₁ ⋆ Y₁, w=1, e=(2,0,0)
Solution B: X₂ ⋆ Y₂, w=3, e=(1,1,0)
```

**Trade-off**:
- A: Better components, worse compatibility
- B: Worse components, better compatibility

**Pareto frontier**: Both A and B may be efficient!

**Decision**: Depends on application priorities

## Advanced: Probabilistic Compatibility

**Idea**: Instead of deterministic {0, 1, 2, 3}, use probabilities

**Example**:
```
P(comp(M₁, L₁) = 3) = 0.6
P(comp(M₁, L₁) = 2) = 0.3
P(comp(M₁, L₁) = 1) = 0.1
```

**Expected value**: E[comp(M₁, L₁)] = 0.6×3 + 0.3×2 + 0.1×1 = 2.5

**Use case**: High uncertainty, risk analysis

**Beyond scope**: This project uses deterministic ordinal scales

## Implementation Checklist

- [ ] Define compatibility scale (binary vs. ordinal)
- [ ] Identify all component pairs needing compatibility
- [ ] Choose assessment method (expert, testing, historical, hybrid)
- [ ] Collect expert ratings (if applicable)
- [ ] Aggregate multi-expert ratings (min/median/average/weighted)
- [ ] Validate matrix (symmetric, no negative values)
- [ ] Store efficiently (sparse vs. dense)
- [ ] Implement w(S) computation
- [ ] Test with sample solutions
- [ ] Visualize for validation

## Common Issues

### Issue 1: Too Many Zeros

**Problem**: Most pairs incompatible, very few admissible solutions

**Solutions**:
- Relax compatibility threshold (w(S) ≥ 0 instead of ≥ 1)
- Add new DAs with better compatibility
- Improve interfaces (increase compatibility ratings)

### Issue 2: Expert Disagreement

**Problem**: Experts have wildly different compatibility ratings

**Solutions**:
- Investigate root cause (different assumptions, experiences)
- Show disagreement range to decision-makers
- Use weighted aggregation based on expert reliability
- Facilitate expert discussion to reach consensus

### Issue 3: Missing Data

**Problem**: Some DA pairs not rated

**Solutions**:
- Default to 0 (conservative)
- Infer from similar pairs (rule-based)
- Use average compatibility of related DAs
- Mark as "unknown" and flag for expert review

## Next Steps

- **04-hmmd-method.md**: How compatibility integrates with optimization
- **08-bottlenecks.md**: Detecting weak compatibility links
- **09-improvement.md**: Improving compatibility through redesign
- **10-aggregation.md**: Advanced multi-expert aggregation
- **13-implementation-guide.md**: Data structures and algorithms
