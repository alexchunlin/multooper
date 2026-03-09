# Multi-Objective Optimization System - Overview

**Project Goal**: Web interface for multi-objective optimization of modular systems, replacing Excel sheets and custom Python code.

**Theoretical Foundation**: "Modular System Design and Evaluation" by Mark Sh. Levin (Springer, 2015)

## What This System Does

Designs complex modular systems by:
1. **Modeling** system hierarchies (system → subsystems → modules → components)
2. **Evaluating** design alternatives (DAs) for each component
3. **Assessing** compatibility between alternatives
4. **Optimizing** to find Pareto-efficient system configurations
5. **Aggregating** multiple expert opinions
6. **Tracking** system evolution over time

## Key Capabilities

### Input
- Hierarchical system structure (tree-based)
- Design alternatives (DAs) for each component
- Quality ratings for DAs (ordinal or multiset)
- Compatibility ratings between DAs
- Multiple expert opinions on all ratings

### Processing
- **HMMD** (Hierarchical Morphological Multicriteria Design): Primary optimization method
- **Pareto-efficient solution selection**: Find best trade-off solutions
- **Multi-expert aggregation**: Median-based consensus building
- **Bottleneck detection**: Identify weak points
- **Evolution tracking**: Version management and forecasting

### Output
- Pareto-efficient system configurations
- Quality scores (compatibility + component quality)
- Bottleneck analysis
- Improvement recommendations
- Evolution forecasts
- Version comparisons

## Documentation Guide

### Start Here
- **01-core-concepts.md**: Learn the terminology (DAs, compatibility, Pareto efficiency)
- **02-hierarchical-structures.md**: Understand system hierarchy types

### Core Methods
- **03-morphological-design.md**: Overview of design approaches
- **04-hmmd-method.md**: **PRIMARY METHOD** - Detailed implementation guide
- **05-multiset-estimates.md**: Advanced quality representation
- **06-compatibility.md**: How components interact

### Mathematical Foundations
- **12-math-foundations.md**: Rigorous treatment (posets, Pareto, multisets)

### Analysis Features
- **07-system-evaluation.md**: Overall quality assessment
- **08-bottlenecks.md**: Identify weaknesses
- **09-improvement.md**: Redesign strategies
- **10-aggregation.md**: Combine solutions and expert opinions
- **11-evolution.md**: Track changes over time

### Implementation
- **13-implementation-guide.md**: Web interface implementation guide

## Quick Example: GSM Network Design

**System**: GSM Network = Switching SubSystem (SSS) ⋆ Base Station SubSystem (BSS)

**SSS** = MSC/VLR (M) ⋆ HLR/AC (L)
**BSS** = BSC (V) ⋆ BTS (U) ⋆ TRx (T)

**DAs for M**: M₁ (Motorola), M₂ (Alcatel), M₃ (Huawei), M₄ (Siemens), M₅ (Ericsson)

**Quality Rating**: M₄ has priority 1 (best), M₁ has priority 2, etc.

**Compatibility**: M₄ compatible with L₂ (rating=3), M₁ compatible with L₂ (rating=2)

**Optimization**: Find Pareto-efficient combinations like:
- S₁ = M₄ ⋆ L₂ ⋆ V₅ ⋆ U₁ ⋆ T₅ (quality vector: w=2, e=(3,0,0))
- S₂ = M₄ ⋆ L₂ ⋆ V₂ ⋆ U₄ ⋆ T₂ (quality vector: w=2, e=(3,0,0))

## Multi-Expert Feature

**Problem**: Different experts have different opinions on DA quality and compatibility

**Solution**:
1. Each expert rates DAs using multiset estimates: e(M₄) = (3,0,0) means "3 votes for quality level 1, 0 for level 2, 0 for level 3"
2. Aggregate via median: M^g = argmin Σδ(M, eₖ)
3. Show disagreement: Display range of expert opinions
4. Allow expert weighting: Give more weight to domain specialists

**Applies to**:
- DA quality ratings
- Compatibility assessments
- Criteria weights
- Solution preferences
- Evolution forecasts

## Key Innovation

Unlike traditional methods that use single numerical scores, this system:
- Uses **ordinal scales** and **multiset estimates** to handle uncertainty
- Finds **multiple Pareto-efficient solutions** instead of one "optimal"
- Makes **math transparent** and **tweakable**
- **Aggregates expert opinions** systematically
- Tracks **system evolution** with versioning

## Next Steps

1. Read **01-core-concepts.md** to understand the terminology
2. Read **04-hmmd-method.md** to understand the core algorithm
3. Read **13-implementation-guide.md** for implementation details
4. Reference **12-math-foundations.md** when implementing mathematical operations
