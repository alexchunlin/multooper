# System Evaluation

## Overview

System evaluation assesses the **overall quality** of a designed system, including both individual component quality and system-level properties.

## Assessment Techniques

### 1. Expert Judgment

**Process**: Domain expert(s) rate system on quality scale

**Scales**:
- Ordinal: {1, 2, 3, ..., l}
- Multiset: (η₁, η₂, ..., ηₗ)
- Numerical: [0-100]

**Pros**: Fast, captures tacit knowledge
**Cons**: Subjective, expert-dependent

### 2. Technical Measurement

**Process**: Test system, measure performance metrics

**Examples**:
- Throughput (requests/sec)
- Latency (ms)
- Reliability (MTBF hours)
- Cost ($)

**Pros**: Objective, data-driven
**Cons**: Requires prototype, expensive

### 3. Simulation

**Process**: Build model, simulate under various conditions

**Pros**: Tests scenarios not feasible in real world
**Cons**: Model accuracy critical, computationally expensive

### 4. Historical Data

**Process**: Analyze similar past systems

**Pros**: Empirical, inexpensive
**Cons**: May not apply to new system

### 5. Composite Methods

**Process**: Combine multiple techniques

**Example**:
1. Technical measurement for quantifiable metrics
2. Expert judgment for qualitative aspects
3. Simulation for edge cases
4. Historical data for validation

## Scale Types and Transformations

### Quantitative → Ordinal

**Method**: Divide into intervals

**Example**:
```
Cost ($)      → Ordinal Level
0-10,000      → 1 (excellent)
10,001-50,000 → 2 (good)
50,001-100,000→ 3 (moderate)
>100,000      → 4 (poor)
```

**Thresholds**: Define based on:
- Expert judgment
- Historical benchmarks
- Equal intervals
- Percentile-based

### Ordinal → Ordinal

**Method**: Direct mapping

**Example**:
```
5-level scale → 3-level scale
{1,2} → 1 (good)
{3}   → 2 (moderate)
{4,5} → 3 (poor)
```

### Quantitative → Multiset

**Method**: Multiple measurements → distribute votes

**Example**:
```
Measure cost 3 times: {$8K, $12K, $15K}

On scale [0-10K, 10K-50K, 50K-100K]:
$8K  → Level 1
$12K → Level 2
$15K → Level 2

Multiset: (1, 2, 0)
```

## Integration: Component → System

### Method 1: Aggregation

**Formula**: e(S) = e(DA₁) ⊎ e(DA₂) ⊎ ... ⊎ e(DAₘ)

**Result**: Integrated multiset estimate

**Use case**: Bottom-up quality computation

### Method 2: Median

**Formula**: e(S) = median{e(DA₁), ..., e(DAₘ)}

**Result**: "Typical" component quality

**Use case**: When components should be balanced

### Method 3: Reference Points

**Process**:
1. Define reference systems (ideal, acceptable, minimal)
2. Compare system S to references
3. Assign quality based on proximity

**Use case**: When absolute quality hard to define

### Method 4: Integration Tables

**Structure**: Lookup table for combining ordinal estimates

**Example**:
```
       Component 2
Comp 1  1   2   3
  1    1   1   2
  2    1   2   2
  3    2   2   3
```

**Use case**: Small number of components, expert-defined rules

## Multi-Expert System Evaluation

### Approach 1: Aggregate Component Ratings

1. Each expert rates components
2. Aggregate component ratings (median)
3. Compute system quality from aggregated components

**Pros**: Simple, modular
**Cons**: Loses expert-level system view

### Approach 2: Aggregate System Ratings

1. Each expert rates entire system
2. Aggregate system ratings (median)

**Pros**: Captures holistic expert view
**Cons**: Requires experts to see full system

### Approach 3: Multi-Objective

**Objectives**:
1. Maximize system quality (median of expert ratings)
2. Minimize expert disagreement (range or variance)

**Find**: Pareto-efficient systems

**Use case**: When disagreement important to highlight

## Evaluation Framework

### Step 1: Define Criteria

**Examples**:
- Performance
- Cost
- Reliability
- Maintainability
- Scalability

### Step 2: Choose Assessment Method per Criterion

| Criterion | Method | Scale |
|-----------|--------|-------|
| Performance | Measurement | Quantitative → Ordinal |
| Cost | Computation | Quantitative |
| Reliability | Expert + Historical | Ordinal |
| Maintainability | Expert | Ordinal |

### Step 3: Transform to Common Scale

Convert all to ordinal [1, l] or multiset

### Step 4: Aggregate Criteria

**Weighted sum**: Σ wᵢ × criterionᵢ

**Pareto**: Multi-objective, find Pareto-efficient

**Integration**: e(S) = ⊎ e(criterionᵢ)

### Step 5: Multi-Expert Aggregation

If multiple experts, aggregate via median

## Visualization

### Radar Chart

Show system quality on multiple criteria:

```
     Performance
        ★★★★☆
Cost ★★★★★   ★★★☆☆ Reliability
     ★★☆☆☆   ★★★★☆ Maintainability
        Scalability
```

### Quality Vector Plot

Plot N(S) = (w, e) in 2D or 3D space

### Comparison Table

Compare multiple systems side-by-side

## Example: GSM Network Evaluation

**System**: S = M₄ ⋆ L₂ ⋆ V₅ ⋆ U₁ ⋆ T₅

**Criteria**:
1. Performance (throughput)
2. Cost (total investment)
3. Reliability (MTBF)
4. Vendor diversity (risk mitigation)

**Evaluation**:
- Performance: Measure → 85K calls/hour → Level 2 (good)
- Cost: Compute → $2.3M → Level 3 (moderate)
- Reliability: Expert → Level 2 (good)
- Vendor diversity: Count vendors → 4 → Level 2 (good)

**Aggregation**: e(S) = (1, 3, 0) [one criterion at level 2, three at level 1, zero at level 3]

**Quality vector**: N(S) = (2; 1,3,0)

## Next Steps

- **07-system-evaluation.md**: This document
- **08-bottlenecks.md**: Identify weak points
- **09-improvement.md**: Improve evaluation
- **10-aggregation.md**: Multi-expert aggregation
