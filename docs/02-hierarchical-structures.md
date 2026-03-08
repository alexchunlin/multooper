# Hierarchical Structures

## Types of Hierarchies

### 1. Tree Structure

Most common type. Each node has exactly one parent.

```
System
├── Subsystem A
│   ├── Module A1
│   └── Module A2
└── Subsystem B
    ├── Module B1
    └── Module B2
```

**Properties**:
- |E| = |V| - 1
- Unique path between any two nodes
- No cycles

**Use case**: Most system decompositions

### 2. Forest

Collection of disconnected trees.

```
Tree 1:    Tree 2:    Tree 3:
  A          B          C
 / \          \          \
D   E          F          G
```

**Use case**: Multiple independent subsystems

### 3. Morphological Hierarchy

Tree + Design Alternatives at leaves + Compatibility edges

```
        System
       /      \
    A           B
   / \         / \
  A₁ A₂      B₁ B₂
  
Plus compatibility:
A₁ ←→ B₁ (compat=3)
A₁ ←→ B₂ (compat=1)
A₂ ←→ B₁ (compat=0)
A₂ ←→ B₂ (compat=2)
```

**This is the primary structure for HMMD**

### 4. Multi-Layer Structure

Hierarchical network with multiple layers.

```
Layer 3:    [Core Network]
              ↓
Layer 2:    [Distribution]  [Distribution]
              ↓                ↓
Layer 1:    [Access] [Access] [Access] [Access]
```

**Use case**: Communication networks, organizational hierarchies

### 5. Polytree

Directed acyclic graph where nodes can have multiple parents.

```
    R1     R2
     \    /  \
      \  /    \
       N       N'
      / \     / \
     L1 L2   L3 L4
```

**Use case**: Systems with shared components

## Design Methods

### Method 1: Expert-Based Top-Down

**Process**:
1. Domain expert defines top-level system
2. Decompose into subsystems
3. Recursively decompose until leaf nodes
4. Expert validates structure

**Pros**: Captures domain knowledge, intuitive
**Cons**: Subjective, time-consuming

### Method 2: Hierarchical Clustering

**Process**:
1. List all atomic components
2. Compute similarity matrix
3. Apply clustering algorithm (agglomerative)
4. Build hierarchy from clusters

**Pros**: Data-driven, objective
**Cons**: May not match domain mental model

### Method 3: Functional Decomposition

**Process**:
1. Identify system functions
2. Group functions by similarity
3. Create hierarchy of function groups
4. Map functions to components

**Pros**: Function-oriented design
**Cons**: May not match physical structure

### Method 4: Ontology-Based

**Process**:
1. Use existing domain ontology
2. Extract relevant subtree
3. Adapt to specific system
4. Validate with experts

**Pros**: Leverages existing knowledge
**Cons**: Ontology may not exist

## Best Practices

1. **Balance depth and width**: Avoid too deep (>5 levels) or too wide (>10 children)
2. **Clear boundaries**: Each node should have well-defined scope
3. **Consistent abstraction**: Each level should be same abstraction level
4. **Minimize cross-links**: Prefer tree structure, add compatibility only between leaves
5. **Document rationale**: Why this decomposition?

## Example: GSM Network

```
GSM Network (Level 0)
│
├── Switching SubSystem (SSS) (Level 1)
│   ├── MSC/VLR (Level 2)
│   │   ├── M₁ (Motorola)
│   │   ├── M₂ (Alcatel)
│   │   ├── M₃ (Huawei)
│   │   ├── M₄ (Siemens)
│   │   └── M₅ (Ericsson)
│   └── HLR/AC (Level 2)
│       ├── L₁ (Motorola)
│       ├── L₂ (Ericsson)
│       ├── L₃ (Alcatel)
│       └── L₄ (Huawei)
│
└── Base Station SubSystem (BSS) (Level 1)
    ├── BSC (Level 2)
    │   ├── V₁ (Motorola)
    │   ├── V₂ (Ericsson)
    │   ├── V₃ (Alcatel)
    │   ├── V₄ (Huawei)
    │   ├── V₅ (Nokia)
    │   └── V₆ (Siemens)
    ├── BTS (Level 2)
    │   ├── U₁ (Motorola)
    │   ├── U₂ (Ericsson)
    │   ├── U₃ (Alcatel)
    │   ├── U₄ (Huawei)
    │   └── U₅ (Nokia)
    └── TRx (Level 2)
        ├── T₁ (Alcatel)
        ├── T₂ (Ericsson)
        ├── T₃ (Motorola)
        ├── T₄ (Huawei)
        └── T₅ (Siemens)
```

**Depth**: 3 levels
**Width**: 2 → 5 → 5 DAs per component
**Total DAs**: 5+4+6+5+5 = 25
**Total combinations**: 5×4×6×5×5 = 3,000

## Next Steps

- **01-core-concepts.md**: Core terminology
- **04-hmmd-method.md**: Optimization using hierarchies
- **07-system-evaluation.md**: Evaluating hierarchical systems
