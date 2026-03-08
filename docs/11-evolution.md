# Evolution and Forecasting

Track system changes over time and predict future improvements.

## System Evolution

**System generations**: S¹, S², S³, ..., Sᵏ

**Each generation**: Improved version of system

**Evolution process**: Sequential improvements

**Example**:
```
Generation 1 (2020): S¹ = M₁ ⋆ L₁ ⋆ V₂ ⋆ U₃ ⋆ T₂
Generation 2 (2022): S² = M₄ ⋆ L₂ ⋆ V₅ ⋆ U₁ ⋆ T₅
Generation 3 (2024): S³ = M₄ ⋆ L₄ ⋆ V₅ ⋆ U₃ ⋆ T₄
```

## Change Operations

### Operation 1: Add Component

**Notation**: +Xᵢ (add DA Xᵢ)

**Effect**: Introduces new DA to system

**Example**: S¹ → S² via +M₄

### Operation 2: Remove Component

**Notation**: -Xᵢ (remove DA Xᵢ)

**Effect**: Removes DA from system

**Example**: S² → S³ via -L₂

### Operation 3: Replace Component

**Notation**: Xᵢ → Xⱼ (replace Xᵢ with Xⱼ)

**Effect**: Upgrades/downgrades DA

**Example**: S¹ → S² via M₁ → M₄

### Operation 4: Improve Compatibility

**Notation**: comp(Xᵢ, Yⱼ)↑ (improve compatibility)

**Effect**: Increases compatibility rating

**Example**: comp(M₁, L₁): 1 → 3

### Operation 5: Degrade Compatibility

**Notation**: comp(Xᵢ, Yⱼ)↓ (degrade compatibility)

**Effect**: Decreases compatibility rating

**Example**: comp(V₂, U₃): 3 → 1

## Evolution Analysis

### Step 1: Detect Changes

**Compare generations**:
```
S¹ = M₁ ⋆ L₁ ⋆ V₂ ⋆ U₃ ⋆ T₂
S² = M₄ ⋆ L₂ ⋆ V₅ ⋆ U₁ ⋆ T₅

Changes:
M₁ → M₄ (replace)
L₁ → L₂ (replace)
V₂ → V₅ (replace)
U₃ → U₁ (replace)
T₂ → T₅ (replace)
```

### Step 2: Classify Changes

**Categories**:
- **Upgrade**: Priority improves (M₁(2) → M₄(1))
- **Downgrade**: Priority worsens
- **Neutral**: Same priority
- **Compatibility change**: Interface modification

**Example**:
```
M₁(2) → M₄(1): Upgrade ✓
L₁(1) → L₂(1): Neutral
V₂(1) → V₅(1): Neutral
U₃(3) → U₁(1): Upgrade ✓
T₂(2) → T₅(1): Upgrade ✓
```

### Step 3: Identify Trends

**Question**: What patterns repeat across generations?

**Examples**:
- Always upgrading MSC (M₁ → M₂ → M₄)
- Vendor consolidation (multiple vendors → single vendor)
- Compatibility improvements (interfaces standardizing)

### Step 4: Build Evolution Model

**Components**:
- Historical changes (S¹ → S², S² → S³, ...)
- Change frequencies (which components change most?)
- Upgrade patterns (which DAs are preferred?)

## Forecasting

**Goal**: Predict S⁴, S⁵, ... (future generations)

### Method 1: Extrapolation

**Process**:
1. Identify trend (e.g., "MSC upgrades every 2 years")
2. Extrapolate to future

**Example**:
```
History:
2020: M₁
2022: M₄
2024: M₄

Trend: MSC upgraded in 2022, then stable

Forecast:
2026: M₄ (stable)
2028: M₄ or M₅ (if new DA added)
```

### Method 2: Combinatorial Synthesis

**Process**:
1. Build "system kernel": Common elements across recent generations
2. Identify change candidates: DAs not in kernel
3. Synthesize forecasts via HMMD

**Kernel**:
```
S² = M₄ ⋆ L₂ ⋆ V₅ ⋆ U₁ ⋆ T₅
S³ = M₄ ⋆ L₄ ⋆ V₅ ⋆ U₃ ⋆ T₄

Kernel: {M₄, V₅} (appear in both)
```

**Change candidates**:
```
For L: {L₂, L₄, L₁, L₃, ...}
For U: {U₁, U₃, U₂, U₄, ...}
For T: {T₅, T₄, T₁, T₂, ...}
```

**Synthesis**: Run HMMD with:
- Fixed: M₄, V₅
- Variable: L, U, T

**Result**: Pareto-efficient forecasts S⁴₁, S⁴₂, S⁴₃, ...

### Method 3: Expert-Based

**Process**:
1. Ask experts to propose S⁴
2. Aggregate via voting or consensus
3. Validate with HMMD

**Example**:
```
Expert 1: S⁴₁ = M₄ ⋆ L₂ ⋆ V₅ ⋆ U₃ ⋆ T₁
Expert 2: S⁴₂ = M₄ ⋆ L₄ ⋆ V₅ ⋆ U₁ ⋆ T₄
Expert 3: S⁴₃ = M₅ ⋆ L₄ ⋆ V₅ ⋆ U₃ ⋆ T₄

Aggregate (voting):
M: {M₄, M₄, M₅} → M₄
L: {L₂, L₄, L₄} → L₄
V: {V₅, V₅, V₅} → V₅
U: {U₃, U₁, U₃} → U₃
T: {T₁, T₄, T₄} → T₄

S⁴ = M₄ ⋆ L₄ ⋆ V₅ ⋆ U₃ ⋆ T₄
```

### Method 4: Multi-Scenario

**Process**:
1. Define scenarios (optimistic, pessimistic, neutral)
2. Generate forecast for each scenario
3. Show range to decision-makers

**Example**:
```
Optimistic: S⁴_opt = M₅ ⋆ L₄ ⋆ V₅ ⋆ U₃ ⋆ T₁ (best DAs)
Neutral:    S⁴_neu = M₄ ⋆ L₄ ⋆ V₅ ⋆ U₃ ⋆ T₄ (median DAs)
Pessimistic: S⁴_pes = M₄ ⋆ L₂ ⋆ V₅ ⋆ U₁ ⋆ T₅ (conservative)

Show all three to decision-maker
```

## Aggregation of Forecasts

### Scenario: Multiple forecast methods produce different S⁴

**Input**: S⁴₁, S⁴₂, ..., S⁴ₙ from different methods/experts

**Output**: Aggregated forecast S⁴

**Methods**:
1. **Voting** (per component)
2. **Consensus kernel** + fill gaps
3. **Weighted** (by method accuracy)
4. **Multi-objective** (quality × agreement)

**Example**:
```
Forecasts:
S⁴₁ (combinatorial): M₄ ⋆ L₄ ⋆ V₅ ⋆ U₃ ⋆ T₁
S⁴₂ (expert-based):  M₄ ⋆ L₂ ⋆ V₅ ⋆ U₃ ⋆ T₄
S⁴₃ (trend-based):   M₄ ⋆ L₄ ⋆ V₅ ⋆ U₁ ⋆ T₄

Aggregated (voting):
M₄: 3 votes
L₄: 2 votes, L₂: 1 vote → L₄
V₅: 3 votes
U₃: 2 votes, U₁: 1 vote → U₃
T₁: 1 vote, T₄: 2 votes → T₄

S⁴ = M₄ ⋆ L₄ ⋆ V₅ ⋆ U₃ ⋆ T₄
```

## Evolution Tracking with Version Control

### Version Tags

**Purpose**: Mark significant system states

**Tags**:
- `v1.0`: Initial design
- `v1.1`: Minor improvement
- `v2.0`: Major redesign
- `release-2024`: Production release

**Example**:
```
v1.0 (2020-01): S¹ = M₁ ⋆ L₁ ⋆ V₂ ⋆ U₃ ⋆ T₂
v1.1 (2020-06): S¹' = M₁ ⋆ L₂ ⋆ V₂ ⋆ U₃ ⋆ T₂ (L upgraded)
v2.0 (2022-01): S² = M₄ ⋆ L₂ ⋆ V₅ ⋆ U₁ ⋆ T₅ (major upgrade)
v2.1 (2023-01): S²' = M₄ ⋆ L₄ ⋆ V₅ ⋆ U₁ ⋆ T₅ (L upgraded)
v3.0 (2024-01): S³ = M₄ ⋆ L₄ ⋆ V₅ ⋆ U₃ ⋆ T₄ (U, T changed)
```

### Version Comparison

**Metrics**:
- DA changes (count)
- Quality improvement: ΔN(S) = N(S') - N(S)
- Compatibility change: Δw(S)
- Cost of transition

**Example**:
```
Compare v2.0 → v3.0:

DA changes: 2 (U₁ → U₃, T₅ → T₄)
Quality: N(S²) = (2;3,0,0) → N(S³) = (3;0,2,1)
  - w improved: 2 → 3
  - e changed: (3,0,0) → (0,2,1) [worse!]
  
Compatibility: w improved, but element quality worse
Cost: Medium (2 component replacements)
```

### Evolution Timeline

**Visualization**: Show system changes over time

```
2020  2021  2022  2023  2024  2025
 |     |     |     |     |     |
 v1.0  |    v2.0   |    v3.0  |
  |____|_____|_____|_____|_____|
        ↑         ↑         ↑
      Major    Major    Forecast
      upgrade  upgrade  v4.0?
```

## Forecast Validation

### Retrospective Validation

**Process**:
1. Use data up to time T
2. Forecast for T+Δ
3. Compare forecast to actual at T+Δ
4. Compute accuracy

**Metrics**:
- DA prediction accuracy: % correct DAs
- Quality accuracy: |N(S_forecast) - N(S_actual)|
- Ranking accuracy: Correlation of Pareto frontiers

**Example**:
```
Forecast in 2022 for 2024: S⁴_forecast = M₄ ⋆ L₂ ⋆ V₅ ⋆ U₁ ⋆ T₅
Actual in 2024:            S³_actual = M₄ ⋆ L₄ ⋆ V₅ ⋆ U₃ ⋆ T₄

DA accuracy: 3/5 = 60% (M₄, V₅ correct; L, U, T wrong)
```

### Cross-Validation

**Process**:
1. Split historical data into folds
2. Train on fold i, validate on fold i+1
3. Average accuracy

**Use case**: Tune forecasting method parameters

## Multi-Expert Evolution

### Expert-Based Forecasts

**Process**:
1. Each expert proposes future system S⁴
2. Aggregate via voting or consensus
3. Show disagreement

**Example**:
```
Expert 1 (optimist): S⁴₁ = M₅ ⋆ L₄ ⋆ V₅ ⋆ U₃ ⋆ T₁
Expert 2 (conservative): S⁴₂ = M₄ ⋆ L₂ ⋆ V₅ ⋆ U₁ ⋆ T₄
Expert 3 (neutral): S⁴₃ = M₄ ⋆ L₄ ⋆ V₅ ⋆ U₃ ⋆ T₄

Disagreement:
- M: {M₅, M₄, M₄} → medium
- L: {L₄, L₂, L₄} → medium
- V: {V₅} → none
- U: {U₃, U₁, U₃} → medium
- T: {T₁, T₄, T₄} → high

Aggregate: S⁴ = M₄ ⋆ L₄ ⋆ V₅ ⋆ U₃ ⋆ T₄
```

### Disagreement as Uncertainty

**High disagreement** → Uncertain forecast

**Low disagreement** → Confident forecast

**Action**: Focus research on high-disagreement components

## Implementation

```typescript
class EvolutionTracker {
  
  // Detect changes between two generations
  detectChanges(S1: Solution, S2: Solution): Change[] {
    const changes: Change[] = [];
    
    for (const [comp, da1] of S1.selections) {
      const da2 = S2.selections.get(comp);
      
      if (da2 && da1 !== da2) {
        changes.push({
          type: 'replace',
          component: comp,
          from: da1,
          to: da2
        });
      }
    }
    
    return changes;
  }
  
  // Build system kernel
  buildKernel(solutions: Solution[]): Set<string> {
    if (solutions.length === 0) return new Set();
    
    let kernel = new Set(solutions[0].selections.values());
    
    for (const sol of solutions.slice(1)) {
      const currentDAs = new Set(sol.selections.values());
      kernel = new Set([...kernel].filter(da => currentDAs.has(da)));
    }
    
    return kernel;
  }
  
  // Generate forecasts via combinatorial synthesis
  generateForecasts(
    kernel: Set<string>,
    systemId: string
  ): Solution[] {
    // Get components not in kernel
    const allComponents = this.getComponents(systemId);
    const kernelComponents = new Set(
      Array.from(kernel).map(da => this.getDAComponent(da))
    );
    const variableComponents = allComponents.filter(
      c => !kernelComponents.has(c.id)
    );
    
    // Run HMMD with fixed kernel + variable components
    const optimizer = new HMMDOptimizer();
    optimizer.fixDAs(kernel);
    
    return optimizer.optimize(systemId);
  }
  
  // Aggregate multiple forecasts
  aggregateForecasts(
    forecasts: Solution[],
    components: string[]
  ): Solution {
    const aggregator = new Aggregator();
    const selections = new Map<string, string>();
    
    for (const comp of components) {
      const das = forecasts
        .map(f => f.selections.get(comp))
        .filter(da => da !== undefined);
      
      selections.set(comp, aggregator.vote(das));
    }
    
    return {
      id: generateId(),
      systemId: forecasts[0].systemId,
      selections,
      qualityVector: this.evaluate(selections),
      isParetoEfficient: false
    };
  }
  
  // Compute evolution metrics
  computeEvolutionMetrics(
    from: Solution,
    to: Solution
  ): EvolutionMetrics {
    const changes = this.detectChanges(from, to);
    
    return {
      numChanges: changes.length,
      upgrades: changes.filter(c => this.isUpgrade(c)).length,
      downgrades: changes.filter(c => this.isDowngrade(c)).length,
      qualityDelta: this.computeQualityDelta(from, to),
      compatibilityDelta: to.qualityVector.w - from.qualityVector.w
    };
  }
  
  // Forecast validation
  validateForecast(
    forecast: Solution,
    actual: Solution
  ): ValidationMetrics {
    let correctDAs = 0;
    const totalDAs = forecast.selections.size;
    
    for (const [comp, da] of forecast.selections) {
      if (actual.selections.get(comp) === da) {
        correctDAs++;
      }
    }
    
    return {
      daAccuracy: correctDAs / totalDAs,
      qualityError: this.qualityDistance(forecast.qualityVector, actual.qualityVector)
    };
  }
}
```

## Example: Educational Course Evolution

**System**: Modular Educational Course

**Components**: H (Theory), B (Practice), L (Lab)

**Generations**:
```
S¹ (2019): H₁ ⋆ B₁ ⋆ L₁  (traditional)
S² (2021): H₂ ⋆ B₂ ⋆ L₁  (modernized theory & practice)
S³ (2023): H₂ ⋆ B₃ ⋆ L₂  (updated practice, added lab)
```

**Changes**:
- 2019 → 2021: H₁ → H₂, B₁ → B₂ (modernization)
- 2021 → 2023: B₂ → B₃, L₁ → L₂ (practice update, lab upgrade)

**Kernel**:
```
S² ∩ S³ = {H₂}
```

**Forecast for 2025**:
1. Fix H₂
2. Variable: B, L
3. Run HMMD

**Forecasts**:
```
S⁴₁ = H₂ ⋆ B₃ ⋆ L₂ (conservative, same as S³)
S⁴₂ = H₂ ⋆ B₄ ⋆ L₂ (upgrade practice)
S⁴₃ = H₂ ⋆ B₃ ⋆ L₃ (upgrade lab)
```

**Aggregated**: S⁴ = H₂ ⋆ B₃ ⋆ L₂ (most likely)

## Next Steps

- **09-improvement.md**: Improvement strategies
- **10-aggregation.md**: Aggregating forecasts
- **13-implementation-guide.md**: Version control implementation
