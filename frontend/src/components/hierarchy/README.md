# Hierarchy Editor Component

Interactive tree-based editor for managing system hierarchies using React Flow.

## Features

### ✅ Implemented

- **Interactive Tree View**: Visual representation of system hierarchy with React Flow
- **Custom Nodes**: Color-coded nodes by type (system, subsystem, module, component)
- **Add/Edit/Delete**: Full CRUD operations for hierarchy nodes
- **Node Details Panel**: Side drawer for editing node properties
- **Search Functionality**: Filter nodes by name or description
- **Demo Data**: Pre-loaded example for testing

### 🚧 Planned

- **Drag & Drop**: Reorganize hierarchy by dragging nodes
- **Zoom Controls**: Advanced zoom and pan controls
- **Export**: Export hierarchy to JSON/CSV
- **Undo/Redo**: Version history for changes

## Usage

### Basic Workflow

1. Navigate to a system overview page
2. Click "Load Demo Data" to populate with sample hierarchy (or start from scratch)
3. Click "Hierarchy" card to open the editor
4. Use the "Add Root" button to create top-level nodes
5. Click the `+` icon on any node to add children
6. Click the edit (pencil) icon to modify node properties
7. Click the delete (trash) icon to remove nodes

### Node Types

- **System** (blue): Top-level system container
- **Subsystem** (green): Major subsystem components
- **Module** (orange): Functional modules
- **Component** (purple): Leaf-level components

### Search

Use the search box in the toolbar to filter nodes by name or description. Matching nodes will be highlighted in the view.

## Technical Details

### Components

- `HierarchyEditor.tsx`: Main page component with React Flow integration
- `CustomNode.tsx`: Custom node renderer for React Flow
- `NodeDetailsPanel.tsx`: Side drawer for editing node properties

### State Management

- Uses Zustand store (`systemStore`) for global state
- Hierarchy data stored as flat array of `SystemNode` objects
- React Flow manages its own nodes/edges state locally

### Layout Algorithm

The editor uses a simple level-based layout:
- Nodes positioned by their depth in the tree
- Horizontal spacing between siblings
- Vertical spacing between levels

## Data Structure

```typescript
interface SystemNode {
  id: string;
  name: string;
  type: 'system' | 'subsystem' | 'module' | 'component';
  parentId: string | null;
  children: string[];  // Array of child node IDs
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}
```

## Demo Data

The demo data includes a complete smart home system hierarchy:
- Smart Home System (root)
  - Lighting Control (subsystem)
    - Indoor Lights (module)
      - LED Driver (component)
      - Motion Sensor (component)
    - Outdoor Lights (module)
      - Weatherproof Fixture (component)
  - Climate Control (subsystem)
    - HVAC Controller (module)
      - Thermostat (component)

## Future Enhancements

1. **Drag & Drop Reorganization**: Allow moving nodes by dragging
2. **Advanced Layout Algorithms**: Tree-specific layout algorithms
3. **Multi-select**: Select multiple nodes for bulk operations
4. **Validation**: Enforce constraints on hierarchy structure
5. **Import/Export**: Load/save hierarchies from files
6. **Collaborative Editing**: Real-time multi-user editing
