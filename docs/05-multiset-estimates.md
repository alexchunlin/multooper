# Multiset Estimates

**Multiset estimates** provide a powerful way to represent uncertainty and aggregate multiple expert opinions.

## Why Multiset Estimates?

**Problem with single ratings**: An expert rates DA quality as "2" on scale [1,2,3]
- Loses information about confidence
- Hard to aggregate multiple experts
- No uncertainty representation

**Solution**: Multiset estimates

**Example**: e(M₄) = (3, 0, 0) means:
- 3 votes for quality level 1 (best)
- 0 votes for quality level 2
- 0 votes for quality level 3 (worst)

**Interpretation**: "High confidence that M₄ is excellent quality"

## Definition

### Assessment Problem P^(l, η)

**Parameters**:
- **l**: Number of quality levels (e.g., l=3 for scale [1,2,3])
- **η**: Number of elements/votes (e.g., η=3 means 3 experts voted)

**Multiset Estimate**: e(A) = (η₁, η₂, ..., ηₗ)

**Meaning**: ηᵢ elements at quality level i

**Constraints**:
1. Σηᵢ = η (total elements equals specified number)
2. **Interval property**: Elements cover a continuous range (no gaps)

**Example P^(3, 3)**:
- (3, 0, 0): All 3 elements at level 1 (best)
- (2, 1, 0): 2 at level 1, 1 at level 2
- (1, 1, 1): 1 at each level
- (0, 3, 0): All 3 at level 2
- (0, 0, 3): All 3 at level 3 (worst)

**Number of possible estimates**: "Multiset coefficient" = (l+η-1 choose η)

For P^(3,3): (3+3-1 choose 3) = (5 choose 3) = 10 estimates

### Interval Property

**Requirement**: Non-zero ηᵢ values must form a continuous interval

**Valid**: (3,0,0) ✓, (2,1,0) ✓, (1,1,1) ✓, (0,2,1) ✓

**Invalid**: (1,0,1) ✗ (gap at level 2), (0,1,0,1) ✗ (two gaps)

**Rationale**: Represents coherent expert opinion, not mixed signals

**Without interval constraint**: More estimates, but less interpretable

## Visual Representation

### Histogram View

For P^(3, 4), estimate e = (2, 1, 1):

```
Level 1: ██ (2 votes)
Level 2: █  (1 vote)
Level 3: █  (1 vote)
```

### Example: Multi-Expert Rating

**Scenario**: 4 experts rate component M₄ on quality

**Expert 1**: "Excellent" → votes for level 1
**Expert 2**: "Excellent" → votes for level 1
**Expert 3**: "Good" → votes for level 2
**Expert 4**: "Moderate" → votes for level 3

**Multiset estimate**: e(M₄) = (2, 1, 1)

**Interpretation**: 
- 2/4 experts say excellent
- 1/4 says good
- 1/4 says moderate
- Shows disagreement among experts

## Operations on Multiset Estimates

### 1. Integration (Summation)

**Purpose**: Combine estimates from multiple components

**Formula**: e^I = e¹ ⊎ e² ⊎ ... ⊎ eⁿ

**Operation**: Sum component-wise

**Example**:
```
e¹ = (2, 1, 0)  [component X]
e² = (1, 1, 1)  [component Y]
e³ = (0, 3, 0)  [component Z]

e^I = (2+1+0, 1+1+3, 0+1+0) = (3, 5, 1)
```

**Use case**: System quality from component qualities

**Multi-expert**: NOT for aggregating expert opinions (use median instead)

### 2. Proximity (Distance)

**Purpose**: Measure how close two estimates are

**Proximity**: δ(e₁, e₂) = (Δ⁻, Δ⁺)

**Δ⁻**: "Downward distance" - how much e₂ is worse than e₁
**Δ⁺**: "Upward distance" - how much e₂ is better than e₁

**Formula** (simplified):
```
For each level i:
  Δ⁻ = max(0, cumulative_worse_in_e₂ - cumulative_worse_in_e₁)
  Δ⁺ = max(0, cumulative_better_in_e₂ - cumulative_better_in_e₁)
```

**Example** (P^(3,4)):
```
e₁ = (3, 1, 0)  [3 at level 1, 1 at level 2]
e₂ = (1, 2, 1)  [1 at level 1, 2 at level 2, 1 at level 3]

δ(e₁, e₂) = (2, 0)

Interpretation: e₂ is worse than e₁ (Δ⁻=2), not better (Δ⁺=0)
```

**Total distance**: |δ(e₁, e₂)| = max(Δ⁻, Δ⁺)

**Properties**:
- δ(e₁, e₂) ≠ δ(e₂, e₁) in general (asymmetric)
- δ(e, e) = (0, 0)
- Transitive: if δ(e₁, e₂) = (0, 0) and δ(e₂, e₃) = (0, 0), then e₁ dominates e₃

### 3. Comparison and Ordering

**Pareto dominance for estimates**:

e₁ **dominates** e₂ if: Δ⁻ = 0 AND Δ⁺ > 0
(i.e., e₁ is at least as good on all levels, strictly better on some)

**Example**:
```
e₁ = (3, 1, 0)
e₂ = (2, 1, 1)

δ(e₁, e₂) = (1, 0)  [e₂ worse by 1]
δ(e₂, e₁) = (0, 1)  [e₁ better by 1]

e₁ dominates e₂ ✓
```

**Pareto-efficient estimates**: Not dominated by any other estimate

### 4. Aggregation (Median)

**Purpose**: Combine multiple expert opinions into consensus

**Generalized Median**:
```
M^g = argmin_{M ∈ D} Σ |δ(M, eₖ)|
```
where D is set of all possible estimates, eₖ are expert estimates

**Set Median**:
```
M^s = argmin_{M ∈ E} Σ |δ(M, eₖ)|
```
where E is the set of expert estimates (simpler, faster)

**Example** (P^(3,4)):
```
Expert estimates:
e₂ = (3, 1, 0)  [expert 1: very optimistic]
e₄ = (1, 3, 0)  [expert 2: moderately optimistic]
e₅ = (0, 4, 0)  [expert 3: neutral]
e₉ = (2, 1, 1)  [expert 4: mixed]
e₁₀ = (1, 2, 1) [expert 5: mixed]

Compute distances:
For M = (0, 3, 1) [candidate median]:
  Σ|δ(M, eₖ)| = 0+3+1+2+0+1+0+2+0+1+0+1+0+3+1 = small

M^g = (0, 3, 1)  [generalized median]
M^s = (1, 2, 1)  [set median - from expert estimates]
```

**Complexity**:
- Generalized median: NP-hard in general, but easy for small (l, η)
- Set median: O(n²) where n = number of experts

**Recommendation**: Use set median for speed, generalized for precision

**Deviation**:
```
Δ(M) = (Δ⁻(M), Δ⁺(M))
Δ⁻(M) = δ(M, worst_expert_estimate)
Δ⁺(M) = δ(best_expert_estimate, M)
|Δ(M)| = max(Δ⁻, Δ⁺)
```

Shows how far median is from extreme opinions.

### 5. Alignment

**Purpose**: Convert estimates with different (l, η) parameters

**Problem**: 
- Expert 1 uses P^(3,2): (1, 1, 0)
- Expert 2 uses P^(3,3): (1, 1, 1)
- Expert 3 uses P^(2,3): (2, 1)

**Solution**: Align to common P^(l, η) where l = max(lᵢ), η = max(ηᵢ)

**Method**:
```
P^(3,2) → P^(4,4):
(1, 1, 0) → (3, 1, 0, 0)  [pad with zeros, extrapolate]

P^(3,3) → P^(4,4):
(1, 1, 1) → (2, 1, 1, 0)

P^(2,3) → P^(4,4):
(2, 1) → (3, 1, 0, 0)  [extend scale]
```

**Rationale**: Conservative - preserves quality distribution

## Using Multiset Estimates in HMMD

### Modified Quality Vector

**Standard HMMD**: N(S) = (w(S); e(S))
- e(S) = (η₁, ..., ηₗ) where ηᵢ = count of DAs with priority i

**Multiset HMMD**: N(S) = (w(S); e(S))
- e(S) = **median** of multiset estimates of selected DAs

**Example**:
```
S = X₁ ⋆ Y₂ ⋆ Z₃

e(X₁) = (2, 1, 0)  [multiset estimate]
e(Y₂) = (1, 1, 1)
e(Z₃) = (0, 3, 0)

e(S) = median{(2,1,0), (1,1,1), (0,3,0)} = (1, 2, 1)
```

### Advantages

1. **Captures uncertainty**: Shows expert confidence
2. **Handles disagreement**: Multiple experts, different opinions
3. **Richer information**: Not just "priority 2" but "(1,2,1)"
4. **Better aggregation**: Median more robust than average

### Modified Problem Formulation

**Objectives**:
1. max w(S) - compatibility
2. max e(S) - component quality (via poset ordering)

**Constraints**:
1. w(S) ≥ 1 - all compatible
2. e(DAᵢ) ⪰ e₀ for all selected DAs - quality threshold

**e₀**: Reference point (e.g., e₀ = (0, 2, 1) for P^(3,3))

**Rationale**: Filter out very poor DAs before optimization

## Common Assessment Problems

### P^(3, 1) - Basic Ordinal
- l=3 levels, η=1 element
- Estimates: (1,0,0), (0,1,0), (0,0,1)
- **Equivalent to standard ordinal rating** (1, 2, or 3)

### P^(3, 3) - Common Multi-Expert
- l=3 levels, η=3 elements (3 experts)
- 10 possible estimates
- **Good for small expert teams**

### P^(3, 4) - Balanced
- l=3 levels, η=4 elements
- 15 possible estimates
- **More nuanced than P^(3,3)**

### P^(3, 5) - Large Teams
- l=3 levels, η=5 elements
- 21 possible estimates
- **Good for 5 experts**

### P^(4, 4) - Detailed Scale
- l=4 levels, η=4 elements
- 35 possible estimates
- **Fine-grained quality distinctions**

## Practical Workflow

### Step 1: Choose Assessment Problem

**Guidelines**:
- l=3: Simple (good/moderate/poor)
- l=4: Detailed (excellent/good/moderate/poor)
- η = number of experts (or higher for uncertainty)

**Recommendation**: Start with P^(3,3) or P^(3,4)

### Step 2: Collect Expert Ratings

**Method A - Direct multiset**:
- Ask each expert to distribute η votes across l levels
- Example: "You have 4 votes. Distribute them across [excellent, good, poor]"

**Method B - Aggregate individual**:
- Each expert gives ordinal rating (1, 2, or 3)
- Convert to multiset: {1,1,2,3} → (2,1,1)

**Method C - Criteria-based**:
- Expert rates DA on multiple criteria
- Aggregate criteria ratings into multiset
- Example: 3 criteria rated {1,2,1} → multiset (2,1,0)

### Step 3: Aggregate Across Experts

**Option 1 - Integration** (NOT recommended for experts):
```
Expert 1: (1, 1, 0)
Expert 2: (2, 0, 1)
Integrated: (3, 1, 1)
```
Problem: Just sums votes, loses median consensus

**Option 2 - Median** (RECOMMENDED):
```
Expert 1: (1, 1, 0)
Expert 2: (2, 0, 1)
Expert 3: (0, 3, 0)
Median: (1, 1, 1) or (0, 3, 0)
```
Finds middle ground

**Option 3 - Show range**:
```
Best: (2, 1, 0)
Median: (1, 2, 1)
Worst: (0, 2, 2)
```
Shows disagreement

### Step 4: Use in HMMD

Replace ordinal priorities with multiset estimates in HMMD algorithm.

## Implementation

### Data Structure
```typescript
interface MultisetEstimate {
  l: number;           // number of levels
  eta: number;         // number of elements
  counts: number[];    // [η₁, η₂, ..., ηₗ]
}

// Example
const e: MultisetEstimate = {
  l: 3,
  eta: 4,
  counts: [2, 1, 1]    // (2, 1, 1)
};
```

### Validation
```typescript
function validateMultiset(e: MultisetEstimate): boolean {
  // Check sum
  if (e.counts.reduce((a,b) => a+b, 0) !== e.eta) return false;
  
  // Check interval property
  let started = false;
  let ended = false;
  for (let count of e.counts) {
    if (count > 0) {
      if (ended) return false;  // gap detected
      started = true;
    } else if (started) {
      ended = true;
    }
  }
  
  return true;
}
```

### Proximity Function
```typescript
function proximity(e1: number[], e2: number[]): [number, number] {
  // Compute cumulative sums from best to worst
  let cum1 = 0, cum2 = 0;
  let deltaDown = 0, deltaUp = 0;
  
  // From best (index 0) to worst (index l-1)
  for (let i = 0; i < e1.length; i++) {
    cum1 += e1[i];
    cum2 += e2[i];
    deltaDown = Math.max(deltaDown, cum2 - cum1);
    deltaUp = Math.max(deltaUp, cum1 - cum2);
  }
  
  return [deltaDown, deltaUp];
}
```

### Median Function
```typescript
function generalizedMedian(estimates: number[][]): number[] {
  // Enumerate all possible estimates
  const allEstimates = generateAllMultisets(l, eta);
  
  let bestMedian = null;
  let minDistance = Infinity;
  
  for (let candidate of allEstimates) {
    let totalDist = 0;
    for (let e of estimates) {
      const [down, up] = proximity(candidate, e);
      totalDist += Math.max(down, up);
    }
    
    if (totalDist < minDistance) {
      minDistance = totalDist;
      bestMedian = candidate;
    }
  }
  
  return bestMedian;
}
```

## Examples

### Example 1: Single Component Multi-Expert

**Component**: MSC/VLR (M)

**Experts**: 4 reliability engineers

**Ratings**:
- Expert 1: "Excellent" → e₁ = (3, 0, 0) [P^(3,3)]
- Expert 2: "Excellent, but some concerns" → e₂ = (2, 1, 0)
- Expert 3: "Good, not excellent" → e₃ = (1, 2, 0)
- Expert 4: "Mixed - depends on use case" → e₄ = (1, 1, 1)

**Median**: M^g = (1, 2, 0) or M^s = (1, 2, 0)

**Interpretation**: Consensus is "good quality" with some uncertainty

### Example 2: System Integration

**System**: S = X ⋆ Y ⋆ Z (3 components)

**Component estimates**:
- e(X) = (2, 1, 0) [2 votes excellent, 1 good]
- e(Y) = (1, 1, 1) [mixed]
- e(Z) = (0, 3, 0) [consensus good]

**System estimate** (via median):
e(S) = median{(2,1,0), (1,1,1), (0,3,0)} = (1, 2, 1)

**Quality vector**: N(S) = (w(S); (1, 2, 1))

## Comparison to Alternatives

| Method | Information | Uncertainty | Multi-Expert | Complexity |
|--------|-------------|-------------|--------------|------------|
| Single ordinal | Low | No | Hard | Low |
| Probabilistic | High | Yes | Hard | High |
| Fuzzy | Medium | Yes | Medium | Medium |
| **Multiset** | **Medium** | **Yes** | **Easy** | **Medium** |

**Multiset advantages**:
- Intuitive for experts (distribute votes)
- Easy to aggregate (median)
- Interval property ensures coherence
- No complex probability theory needed

## Next Steps

- **04-hmmd-method.md**: How to use in optimization
- **06-compatibility.md**: Compatibility can also use multisets
- **10-aggregation.md**: Other aggregation methods
- **12-math-foundations.md**: Formal multiset theory
