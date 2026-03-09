# Bottleneck Detection

**Bottleneck**: System component or interface that limits overall quality.

## Types of Bottlenecks

### 1. Element Bottleneck

**Definition**: Component with poor quality DA

**Detection**: Low priority or poor multiset estimate

**Example**: Component X has only DAs with priority 3 or worse

**Impact**: Limits e(S) - system quality distribution

### 2. Compatibility Bottleneck

**Definition**: Poor compatibility between selected DAs

**Detection**: Low w(S) value

**Example**: w(S) = 1 (minimum compatibility barely acceptable)

**Impact**: Reduces w(S) - compatibility quality

### 3. Structural Bottleneck

**Definition**: Hierarchy structure limits options

**Detection**: Few or no Pareto-efficient solutions

**Example**: Over-constrained system, most combinations incompatible

**Impact**: Reduces solution space, may make system infeasible

## Detection Methods

### Method 1: Pareto Frontier Analysis

**Process**:
1. Find Pareto-efficient solutions
2. Analyze quality vectors N(S) = (w, e)
3. Identify patterns

**Bottleneck indicators**:
- All solutions have w(S) = 1 → Compatibility bottleneck
- All solutions have poor e(S) → Element bottleneck
- Very few Pareto solutions → Structural bottleneck

**Example**:
```
Pareto solutions:
S₁: N(S₁) = (1; 3,0,0)  ← Great components, poor compatibility
S₂: N(S₂) = (2; 1,2,0)  ← Good compatibility, mixed components
S₃: N(S₃) = (3; 0,2,1)  ← Excellent compatibility, poor components

Analysis:
- w ranges from 1-3 (no severe compatibility bottleneck)
- e ranges from (3,0,0) to (0,2,1) (element bottleneck at level 3)
```

### Method 2: Sensitivity Analysis

**Process**:
1. For each DA, temporarily improve its quality
2. Re-run optimization
3. Measure impact on Pareto frontier

**Bottleneck score**: Δ = improvement in Pareto frontier size or quality

**High Δ** → DA is a bottleneck (improving it helps a lot)

**Example**:
```
Improve DA M₄ from priority 2 → priority 1:
- Pareto solutions: 3 → 5 (increase!)
- Bottleneck score: Δ = 2 (high)

Improve DA L₂ from priority 1 → priority 1 (no change):
- Pareto solutions: 3 → 3 (no change)
- Bottleneck score: Δ = 0 (not a bottleneck)
```

### Method 3: Compatibility Analysis

**Process**:
1. For each DA, compute average compatibility with other DAs
2. Identify DAs with low average compatibility

**Bottleneck indicator**: avg_comp(DA) << overall average

**Example**:
```
Average compatibility:
M₁: 2.3
M₂: 2.1
M₃: 0.5  ← Bottleneck! (low compatibility with everything)
M₄: 2.8
M₅: 2.5

Analysis: M₃ is incompatible with most DAs → limits solutions
```

### Method 4: Component Contribution

**Process**:
1. For each component, analyze DA quality distribution
2. Identify components with only poor-quality DAs

**Bottleneck indicator**: Component has no DAs with priority 1

**Example**:
```
Component X DAs: X₁(priority=3), X₂(priority=3), X₃(priority=2)
Component Y DAs: Y₁(priority=1), Y₂(priority=2)

Analysis: Component X has no excellent DAs → element bottleneck
```

### Method 5: Expert Disagreement Analysis

**Process** (for multi-expert systems):
1. Identify DAs with high expert disagreement
2. High disagreement → uncertain quality → potential bottleneck

**Disagreement measure**: Range or variance of expert ratings

**Example**:
```
Expert ratings for DA M₄:
Expert 1: (3,0,0) - excellent
Expert 2: (0,0,3) - poor
Expert 3: (1,1,1) - mixed

Disagreement: High (range from excellent to poor)

Analysis: M₄ quality uncertain → investigate further
```

## Bottleneck Resolution Strategies

### For Element Bottlenecks

1. **Add new DAs**: Introduce higher-quality alternatives
2. **Improve existing DAs**: Upgrade quality through redesign
3. **Change requirements**: Relax constraints if possible

### For Compatibility Bottlenecks

1. **Add adapters**: Improve interface compatibility
2. **Standardize interfaces**: Increase compatibility across the board
3. **Redesign components**: Modify DAs to improve compatibility
4. **Change selection**: Accept lower individual quality for better compatibility

### For Structural Bottlenecks

1. **Restructure hierarchy**: Reorganize components
2. **Relax constraints**: Allow w(S) ≥ 0 instead of w(S) ≥ 1
3. **Add missing DAs**: Fill gaps in DA space
4. **Remove over-constraining DAs**: Delete DAs with universal incompatibility

## Multi-Expert Bottleneck Detection

### Disagreement as Bottleneck Signal

**Hypothesis**: DAs with high expert disagreement are uncertain → may be bottlenecks

**Process**:
1. Compute disagreement score for each DA
2. Identify high-disagreement DAs
3. Investigate root cause
4. Add information or DAs to resolve

**Example**:
```
DA M₄ disagreement: 2.5 (high)
Root cause: Experts have different experience with vendor
Resolution: Provide more data, or add alternative DA from different vendor
```

### Consensus vs. Disagreement

**Consensus bottleneck**: All experts agree DA is poor → clear bottleneck

**Disagreement bottleneck**: Experts disagree → uncertain, investigate

**Action**:
- Consensus → Fix DA
- Disagreement → Investigate, gather more data

## Visualization

### Bottleneck Heatmap

```
Components vs. Quality Levels:

          Priority 1  Priority 2  Priority 3
Comp X        ✓           ✗           ✗      ← Bottleneck (no priority 1)
Comp Y        ✓           ✓           ✗
Comp Z        ✓           ✓           ✓
```

### Compatibility Network

Graph where:
- Nodes = DAs
- Edges = Compatibility (thickness = level)
- Color = Quality (green=good, red=poor)

**Bottlenecks**: Isolated nodes (poor compatibility) or red nodes (poor quality)

### Pareto Frontier Plot

Plot N(S) for all Pareto solutions:
- X-axis: w(S) (compatibility)
- Y-axis: e(S) quality metric

**Bottlenecks**: Clustered at low w or poor e

## Implementation

```typescript
class BottleneckDetector {
  
  detectElementBottlenecks(systemId: string): Bottleneck[] {
    const components = this.getComponents(systemId);
    const bottlenecks: Bottleneck[] = [];
    
    for (const comp of components) {
      const das = this.getDAs(comp.id);
      const hasGoodDA = das.some(da => da.priority === 1);
      
      if (!hasGoodDA) {
        bottlenecks.push({
          type: 'element',
          component: comp,
          severity: 'high',
          recommendation: `Add high-quality DA for ${comp.name}`
        });
      }
    }
    
    return bottlenecks;
  }
  
  detectCompatibilityBottlenecks(systemId: string): Bottleneck[] {
    const das = this.getAllDAs(systemId);
    const bottlenecks: Bottleneck[] = [];
    
    for (const da of das) {
      const avgCompat = this.computeAverageCompatibility(da.id);
      const overallAvg = this.computeOverallAverageCompatibility();
      
      if (avgCompat < overallAvg * 0.5) {
        bottlenecks.push({
          type: 'compatibility',
          da: da,
          severity: avgCompat < 1 ? 'critical' : 'high',
          avgCompatibility: avgCompat,
          recommendation: `Improve compatibility for ${da.name}`
        });
      }
    }
    
    return bottlenecks;
  }
  
  detectStructuralBottlenecks(systemId: string): Bottleneck[] {
    const solutions = this.optimizer.optimize(systemId);
    const paretoCount = solutions.filter(s => s.isParetoEfficient).length;
    
    if (paretoCount < 3) {
      return [{
        type: 'structural',
        severity: 'high',
        paretoSolutions: paretoCount,
        recommendation: 'System over-constrained. Relax constraints or add DAs.'
      }];
    }
    
    return [];
  }
  
  computeDisagreementBottlenecks(systemId: string): Bottleneck[] {
    const das = this.getAllDAs(systemId);
    const bottlenecks: Bottleneck[] = [];
    
    for (const da of das) {
      const ratings = this.getExpertRatings(da.id);
      const disagreement = this.computeDisagreement(ratings);
      
      if (disagreement > this.threshold) {
        bottlenecks.push({
          type: 'disagreement',
          da: da,
          severity: 'medium',
          disagreement: disagreement,
          recommendation: `Investigate expert disagreement for ${da.name}`
        });
      }
    }
    
    return bottlenecks;
  }
}
```

## Example: GSM Network Bottleneck Analysis

**System**: GSM Network with 5 components

**Pareto solutions**: 8

**Analysis**:
1. **Element bottleneck**: Component TRx has no priority-1 DAs
   - DAs: T₁(2), T₂(2), T₃(3), T₄(3), T₅(3)
   - Recommendation: Add high-quality TRx option

2. **Compatibility bottleneck**: DA M₃ has avg compatibility 0.8
   - M₃ incompatible with most L and V DAs
   - Recommendation: Remove M₃ or add adapter

3. **Structural bottleneck**: None (8 Pareto solutions is healthy)

4. **Disagreement bottleneck**: DA V₅ has high expert disagreement
   - Experts: {excellent, moderate, poor}
   - Recommendation: Provide more data on Nokia BSC reliability

## Next Steps

- **09-improvement.md**: How to resolve bottlenecks
- **10-aggregation.md**: Multi-expert disagreement analysis
- **04-hmmd-method.md**: Optimization with bottleneck awareness
