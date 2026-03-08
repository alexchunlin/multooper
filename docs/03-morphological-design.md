# Morphological Design Methods

Overview of different approaches to morphological system design.

## Method Comparison Table

| Method | DA Rating | Compatibility | Quality Measure | Multi-Expert | Complexity | Best For |
|--------|-----------|---------------|-----------------|--------------|------------|----------|
| **Basic MA** | None | Binary {0,1} | Admissibility | No | O(Πqᵢ) | Exploration |
| **Ideal Point** | None | Binary {0,1} | Distance to ideal | No | O(Πqᵢ) | Targeted design |
| **Pareto MA** | None | Binary {0,1} | Multi-criteria | Possible | O(Πqᵢ×c) | Trade-off analysis |
| **Multiple Choice** | Quantitative | None | Additive | Possible | O(m×max qᵢ) | Simple selection |
| **QAP** | Quantitative | Quantitative | Additive | Possible | NP-hard | Interface-heavy systems |
| **HMMD** | Ordinal | Ordinal | Poset-based | **Yes** | NP-hard | **General purpose** |
| **HMMD+Multiset** | Multiset | Ordinal | Poset-based | **Yes** | NP-hard | **Uncertainty handling** |

## Method 1: Basic Morphological Analysis (MA)

**Origin**: Fritz Zwicky (1940s)

**Process**:
1. Build system hierarchy
2. List DAs for each component
3. Assess binary compatibility {0,1}
4. Enumerate all admissible combinations (compatibility=1 for all pairs)

**Output**: Set of admissible solutions

**Pros**: Simple, comprehensive exploration
**Cons**: Many solutions, no ranking, binary compatibility oversimplified

**Example**: 5 components, 3 DAs each → 3⁵=243 combinations, maybe 45 admissible

## Method 2: Closeness to Ideal Point

**Process**:
1. Select "ideal" DA for each component (best individual quality)
2. Form ideal solution: S₀ = X₁ ⋆ Y₁ ⋆ Z₁
3. If S₀ admissible → done
4. Else: find admissible solutions closest to S₀

**Distance metric**: Hamming distance (number of different DAs)

**Pros**: Targeted, reduces solution set
**Cons**: Single ideal point may not exist, loses good alternatives

**Example**:
```
Ideal: S₀ = M₄ ⋆ L₂ ⋆ V₅ (but incompatible)
Closest admissible:
  S₁ = M₄ ⋆ L₂ ⋆ V₁ (distance=1)
  S₂ = M₄ ⋆ L₁ ⋆ V₅ (distance=1)
```

## Method 3: Pareto-Based MA

**Process**:
1. Enumerate all admissible combinations (binary compatibility)
2. Evaluate each on multiple criteria (cost, performance, reliability, etc.)
3. Select Pareto-efficient solutions

**Pareto efficiency**: Solution S₁ dominates S₂ if better on all criteria

**Pros**: Handles multiple criteria, finds trade-offs
**Cons**: Still uses binary compatibility, many criteria needed

**Example**:
```
Solutions evaluated on {cost, performance, reliability}:
S₁: (low, med, high)
S₂: (med, high, med)
S₃: (high, high, low)

Pareto-efficient: S₁, S₂ (S₃ dominated by S₂)
```

## Method 4: Multiple Choice Problem

**Formulation**:
```
max Σᵢ Σⱼ cᵢⱼ xᵢⱼ
s.t. Σⱼ xᵢⱼ = 1 ∀i  (select one DA per component)
     Σᵢ Σⱼ aᵢⱼ xᵢⱼ ≤ b  (resource constraint)
     xᵢⱼ ∈ {0,1}
```

**Pros**: Polynomial time, well-studied, handles resources
**Cons**: Ignores compatibility, additive utility assumption

**Multi-criteria version**: Use Pareto frontier on vector objectives

## Method 5: Quadratic Assignment Problem (QAP)

**Formulation**:
```
max Σᵢ Σⱼ cᵢⱼ xᵢⱼ + Σₗ<ₖ Σⱼ₁ Σⱼ₂ d(l,j₁,k,j₂) xₗⱼ₁ xₖⱼ₂
```

**Components**:
- First term: Individual DA quality
- Second term: Pairwise compatibility

**Pros**: Explicitly models compatibility
**Cons**: NP-hard, exponential complexity

**Use case**: When interfaces dominate system quality

## Method 6: HMMD (Primary Method)

**See detailed description in 04-hmmd-method.md**

**Key features**:
- Ordinal scales (realistic for expert judgment)
- Explicit compatibility modeling
- Pareto-efficient selection
- Multi-expert aggregation
- Hierarchical composition

**Quality vector**: N(S) = (w(S); e(S))
- w(S): Compatibility quality
- e(S): Component quality distribution

**Advantages over other methods**:
- More realistic than binary compatibility
- More informative than single criterion
- Handles uncertainty via ordinal scales
- Supports multi-expert naturally

## Method 7: HMMD with Multiset Estimates

**Extension of HMMD** using multiset estimates instead of ordinal priorities.

**Advantages**:
- Captures expert confidence
- Represents uncertainty explicitly
- Better multi-expert aggregation (median)
- Shows disagreement range

**See 05-multiset-estimates.md** for details

## Choosing a Method

### Decision Tree

```
Is compatibility important?
├─ No → Multiple Choice Problem
└─ Yes
    └─ Do you have multiple experts?
        ├─ No
        │   └─ Binary compatibility sufficient?
        │       ├─ Yes → Basic MA or Pareto MA
        │       └─ No → HMMD
        └─ Yes → HMMD or HMMD+Multiset
```

### Guidelines

**Use Basic MA when**:
- Exploring design space
- Binary compatibility sufficient
- No need to rank solutions

**Use Ideal Point when**:
- Clear target exists
- Want to minimize deviation
- Simple distance metric sufficient

**Use Pareto MA when**:
- Multiple criteria available
- Binary compatibility sufficient
- Need trade-off visualization

**Use Multiple Choice when**:
- Compatibility not important
- Resource constraints exist
- Fast solution needed

**Use QAP when**:
- Interfaces dominate quality
- Quantitative compatibility data exists
- Small problem size

**Use HMMD when**:
- Ordinal scales appropriate
- Compatibility important
- Multi-expert input needed
- General-purpose solution

**Use HMMD+Multiset when**:
- High uncertainty
- Multiple experts with disagreement
- Need to show confidence ranges
- Advanced analysis required

## Next Steps

- **04-hmmd-method.md**: Detailed HMMD implementation
- **05-multiset-estimates.md**: Multiset extension
- **06-compatibility.md**: Compatibility modeling
- **10-aggregation.md**: Multi-expert methods
