# Aggregation Methods

Methods for combining multiple solutions, expert opinions, and compatibility ratings.

## What Gets Aggregated

1. **Expert ratings** (DA quality, compatibility)
2. **Solutions** (composite DAs)
3. **Compatibility matrices**
4. **Improvement actions**
5. **Evolution forecasts**

## Aggregation Methods

### Method 1: Median

**Use case**: Robust aggregation, handles outliers

**Types**:
- **Set median**: Choose from existing items
- **Generalized median**: Can choose from all possibilities

**Formula**:
```
M^s = argmin_{x ∈ X} Σ δ(x, xᵢ)
M^g = argmin_{x ∈ Ω} Σ δ(x, xᵢ)
```

where X = given items, Ω = all possible items

**Example (multiset estimates)**:
```
Expert estimates:
e₁ = (3, 0, 0)
e₂ = (1, 2, 0)
e₃ = (0, 3, 0)

Distances from e₂:
δ(e₂, e₁) = (0, 2) → max=2
δ(e₂, e₃) = (1, 0) → max=1
Total: 2+1=3

Set median: M^s = e₂ (minimizes total distance)
```

**Pros**: Robust, intuitive
**Cons**: Set median NP-hard in general (but tractable for small spaces)

### Method 2: Integration (Sum)

**Use case**: Combine component qualities

**Formula**: e^I = e¹ ⊎ e² ⊎ ... ⊎ eⁿ (multiset sum)

**Example**:
```
Component estimates:
e(X) = (2, 1, 0)
e(Y) = (1, 1, 1)
e(Z) = (0, 3, 0)

Integrated: e^I = (2+1+0, 1+1+3, 0+1+0) = (3, 5, 1)
```

**Interpretation**: System has 3 components at level 1, 5 at level 2, 1 at level 3

**Pros**: Simple, preserves all information
**Cons**: Doesn't reduce to single estimate

### Method 3: Minimum (Conservative)

**Use case**: Risk-averse aggregation

**Formula**: agg = min{x₁, x₂, ..., xₙ}

**Example (compatibility)**:
```
Expert compatibility ratings for (M₄, L₂):
Expert 1: 3
Expert 2: 1
Expert 3: 2

Aggregated: min(3, 1, 2) = 1
```

**Pros**: Conservative, ensures no overestimation
**Cons**: Pessimistic, may be too restrictive

### Method 4: Average/Mean

**Use case**: Democratic aggregation

**Formula**: agg = mean{x₁, x₂, ..., xₙ}

**Example (ordinal ratings)**:
```
Expert ratings: {1, 2, 2, 3, 2}
Mean: (1+2+2+3+2)/5 = 2.0
Round: 2
```

**Pros**: Simple, equal weight
**Cons**: Sensitive to outliers, fractional values need rounding

### Method 5: Weighted Average

**Use case**: Expert-weighted aggregation

**Formula**: agg = Σ wᵢxᵢ / Σ wᵢ

**Example**:
```
Expert 1 (weight=0.5): rating=1
Expert 2 (weight=0.3): rating=2
Expert 3 (weight=0.2): rating=3

Weighted avg: (0.5×1 + 0.3×2 + 0.2×3) / (0.5+0.3+0.2)
            = (0.5 + 0.6 + 0.6) / 1.0
            = 1.7
Round: 2
```

**Pros**: Accounts for expert reliability
**Cons**: Requires weight calibration

### Method 6: Voting/Plurality

**Use case**: Discrete choices

**Formula**: agg = mode{x₁, x₂, ..., xₙ}

**Example (DA selection)**:
```
Expert 1 selects: M₄
Expert 2 selects: M₄
Expert 3 selects: M₁
Expert 4 selects: M₄

Votes: {M₄: 3, M₁: 1}
Winner: M₄ (plurality)
```

**Pros**: Simple, democratic
**Cons**: Can select minority preference if vote split

### Method 7: Consensus

**Use case**: Find common elements

**Formula**: agg = ∩{S₁, S₂, ..., Sₙ} (intersection)

**Example (solutions)**:
```
S₁ = {M₄, L₂, V₅}
S₂ = {M₄, L₁, V₅}
S₃ = {M₄, L₂, V₂}

Consensus: {M₄} (only M₄ in all three)
```

**Pros**: High agreement
**Cons**: May be empty if disagreement high

### Method 8: Superstructure

**Use case**: Union of all possibilities

**Formula**: agg = ∪{S₁, S₂, ..., Sₙ} (union)

**Example**:
```
S₁ = {M₄, L₂, V₅}
S₂ = {M₄, L₁, V₅}
S₃ = {M₁, L₂, V₂}

Superstructure: {M₁, M₄, L₁, L₂, V₂, V₅}
```

**Pros**: Comprehensive
**Cons**: May include low-quality options

## Multi-Expert Aggregation Workflow

### Step 1: Collect Individual Ratings

Each expert provides:
- DA quality ratings (ordinal or multiset)
- Compatibility ratings (ordinal)
- Solution preferences (optional)

### Step 2: Aggregate DA Quality Ratings

**Method**: Median (recommended)

**Process**:
```
For each DA Xᵢ:
  1. Collect expert estimates: {e₁(Xᵢ), e₂(Xᵢ), ..., eₙ(Xᵢ)}
  2. Compute set median: M^s = argmin Σδ(M, eⱼ)
  3. Assign: e(Xᵢ) = M^s
```

**Example**:
```
DA M₄ ratings:
Expert 1: (3, 0, 0)
Expert 2: (2, 1, 0)
Expert 3: (0, 3, 0)

Median: (1, 2, 0) or (2, 1, 0)

Assign e(M₄) = (2, 1, 0)
```

### Step 3: Aggregate Compatibility Ratings

**Method**: Median (balanced) or Minimum (conservative)

**Process**:
```
For each DA pair (Xᵢ, Yⱼ):
  1. Collect expert ratings: {c₁, c₂, ..., cₙ}
  2. Compute: c = median{c₁, ..., cₙ}
  3. Assign: comp(Xᵢ, Yⱼ) = c
```

**Example**:
```
comp(M₄, L₂):
Expert 1: 3
Expert 2: 1
Expert 3: 2

Median: 2

Assign comp(M₄, L₂) = 2
```

### Step 4: Show Disagreement

**Purpose**: Transparency, identify uncertain items

**Metrics**:
- **Range**: max - min
- **Variance**: σ²
- **Distance from median**: Σδ(M, eⱼ)

**Example**:
```
DA M₄ disagreement:
- Range: (3,0,0) to (0,3,0) → high
- Variance: high
- Conclusion: High uncertainty, investigate further

DA L₂ disagreement:
- Range: (2,1,0) to (1,2,0) → low
- Variance: low
- Conclusion: Good consensus
```

### Step 5: Re-run Optimization

Use aggregated ratings in HMMD

### Step 6: Compare with Individual Results

**Process**:
1. Run HMMD for each expert individually
2. Run HMMD with aggregated ratings
3. Compare Pareto frontiers

**Insight**: How much do expert opinions affect solutions?

## Aggregation of Solutions

### Scenario: Multiple experts propose different solutions

**Input**: Solutions S₁, S₂, ..., Sₙ from different experts

**Output**: Aggregated solution S'

### Method 1: Voting per Component

**Process**:
```
For each component i:
  1. Collect DAs selected: {S₁[i], S₂[i], ..., Sₙ[i]}
  2. Count votes
  3. Select DA with most votes
  4. S'[i] = winner
```

**Example**:
```
Expert 1: S₁ = M₄ ⋆ L₂ ⋆ V₅
Expert 2: S₂ = M₄ ⋆ L₁ ⋆ V₅
Expert 3: S₃ = M₁ ⋆ L₂ ⋆ V₂

Component M: {M₄, M₄, M₁} → M₄ wins (2 votes)
Component L: {L₂, L₁, L₂} → L₂ wins (2 votes)
Component V: {V₅, V₅, V₂} → V₅ wins (2 votes)

S' = M₄ ⋆ L₂ ⋆ V₅
```

**Pros**: Democratic
**Cons**: May create infeasible combination (check compatibility!)

### Method 2: Consensus Kernel

**Process**:
```
S' = ∩{S₁, S₂, ..., Sₙ}

If S' incomplete (not all components):
  Fill missing with highest-quality DAs
```

**Example**:
```
S₁ = M₄ ⋆ L₂ ⋆ V₅
S₂ = M₄ ⋆ L₁ ⋆ V₅
S₃ = M₁ ⋆ L₂ ⋆ V₂

Kernel: {M₄ ∩ M₄ ∩ M₁, L₂ ∩ L₁ ∩ L₂, V₅ ∩ V₅ ∩ V₂}
      = {∅, ∅, ∅}

No consensus! Use voting instead.
```

### Method 3: Weighted Combination

**Process**:
1. Assign weights to experts (based on reliability)
2. For each component, compute weighted score for each DA
3. Select DA with highest weighted score

**Example**:
```
Expert 1 (w=0.5): M₄
Expert 2 (w=0.3): M₄
Expert 3 (w=0.2): M₁

Weighted score:
M₄: 0.5 + 0.3 = 0.8
M₁: 0.2

Winner: M₄
```

### Method 4: Multi-Objective

**Objectives**:
1. Maximize solution quality N(S')
2. Maximize expert agreement (minimize disagreement)

**Process**:
1. Generate candidate solutions (Pareto-efficient from aggregated ratings)
2. Score each by: quality × agreement
3. Select highest-scoring

**Example**:
```
Candidates:
S₁: N(S₁)=(2;3,0,0), agreement=0.8
S₂: N(S₂)=(3;0,2,1), agreement=0.9

Scores:
S₁: 0.8 × quality(S₁)
S₂: 0.9 × quality(S₂)

Select based on preference
```

## Aggregation of Compatibility Matrices

### Scenario: Multiple experts rate compatibility differently

**Method**: Aggregate cell-by-cell

**Process**:
```
For each cell (i,j):
  1. Collect: {c₁(i,j), c₂(i,j), ..., cₙ(i,j)}
  2. Aggregate: c(i,j) = method{c₁, ..., cₙ}
  3. Assign to aggregated matrix
```

**Method choice**:
- **Minimum**: Conservative (risk-averse)
- **Median**: Balanced (recommended)
- **Average**: Democratic

**Example**:
```
Expert 1 matrix:
     L₁  L₂
M₁    3   2
M₂    0   3

Expert 2 matrix:
     L₁  L₂
M₁    1   2
M₂    1   2

Expert 3 matrix:
     L₁  L₂
M₁    2   3
M₂    0   2

Aggregated (median):
     L₁  L₂
M₁    2   2
M₂    0   2
```

## Aggregation of Improvement Actions

### Scenario: Multiple experts suggest improvements

**Method**: Voting + impact-weighting

**Process**:
```
1. Collect all suggested actions: {a₁, a₂, ..., aₘ}
2. For each action, count votes
3. Estimate impact: I(aᵢ)
4. Score: score(aᵢ) = votes(aᵢ) × I(aᵢ)
5. Rank by score
```

**Example**:
```
Suggested actions:
a₁: "Upgrade MSC" (3 votes, impact=high=3)
a₂: "Add adapter" (1 vote, impact=medium=2)
a₃: "Replace BTS" (2 votes, impact=low=1)

Scores:
a₁: 3 × 3 = 9
a₂: 1 × 2 = 2
a₃: 2 × 1 = 2

Rank: a₁ > a₂ = a₃
```

## Implementation

```typescript
class Aggregator {
  
  // Median aggregation for multiset estimates
  medianAggregate(estimates: MultisetEstimate[]): MultisetEstimate {
    if (estimates.length === 0) {
      throw new Error('Empty estimates');
    }
    
    // Use set median for efficiency
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
  
  // Minimum aggregation
  minAggregate(values: number[]): number {
    return Math.min(...values);
  }
  
  // Median aggregation
  medianAggregate(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2
      ? sorted[mid]
      : Math.round((sorted[mid-1] + sorted[mid]) / 2);
  }
  
  // Weighted average
  weightedAverage(values: number[], weights: number[]): number {
    const sum = values.reduce((s, v, i) => s + v * weights[i], 0);
    const weightSum = weights.reduce((a, b) => a + b, 0);
    return Math.round(sum / weightSum);
  }
  
  // Voting
  vote(options: string[]): string {
    const counts = new Map<string, number>();
    for (const opt of options) {
      counts.set(opt, (counts.get(opt) || 0) + 1);
    }
    
    let winner = options[0];
    let maxVotes = 0;
    for (const [opt, count] of counts) {
      if (count > maxVotes) {
        maxVotes = count;
        winner = opt;
      }
    }
    
    return winner;
  }
  
  // Solution aggregation via voting
  aggregateSolutions(
    solutions: Map<string, string>[],
    components: string[]
  ): Map<string, string> {
    const result = new Map<string, string>();
    
    for (const comp of components) {
      const selectedDAs = solutions
        .map(s => s.get(comp))
        .filter(da => da !== undefined);
      
      result.set(comp, this.vote(selectedDAs));
    }
    
    return result;
  }
  
  // Compute disagreement
  computeDisagreement(estimates: MultisetEstimate[]): number {
    if (estimates.length <= 1) return 0;
    
    const median = this.medianAggregate(estimates);
    let maxDist = 0;
    
    for (const e of estimates) {
      const [down, up] = this.proximity(median, e);
      maxDist = Math.max(maxDist, down, up);
    }
    
    return maxDist;
  }
}
```

## Next Steps

- **05-multiset-estimates.md**: Multiset proximity and median
- **08-bottlenecks.md**: Disagreement as bottleneck indicator
- **09-improvement.md**: Aggregating improvement actions
- **11-evolution.md**: Aggregating evolution forecasts
- **12-math-foundations.md**: Mathematical foundations of aggregation
