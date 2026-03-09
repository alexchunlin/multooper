# Multi-Objective Optimization Platform

A web-based platform for multi-objective optimization of modular systems, based on HMMD (Hierarchical Morphological Multicriteria Design) methodology.

## Overview

This platform replaces Excel sheets and custom Python scripts with a comprehensive web interface for:
- Designing system hierarchies
- Managing Design Alternatives (DAs)
- Collecting multi-expert ratings
- Running optimization algorithms
- Visualizing Pareto-efficient solutions

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- npm or yarn

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL credentials
npm install
npm run db:generate
npm run db:migrate
npm run db:seed  # Optional: load demo data
npm run dev
```

API available at `http://localhost:3001/api`

## Architecture

```
├── frontend/          # React + TypeScript web interface
│   ├── src/
│   │   ├── api/          # API client services
│   │   ├── components/   # UI components
│   │   ├── pages/        # Page components
│   │   ├── stores/       # State management (Zustand)
│   │   ├── data/         # Demo data
│   │   └── types/        # TypeScript definitions
│   └── ...
├── backend/           # Node.js + Express API server
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── middleware/   # Error handling, etc.
│   │   ├── services/     # Prisma client
│   │   ├── config/       # Environment config
│   │   └── prisma/
│   │       └── schema.prisma # Database schema
│   └── ...
├── docs/              # Documentation
│   ├── 00-overview.md
│   ├── 04-hmmd-method.md
│   ├── 06-compatibility.md
│   └── 13-implementation-guide.md
└── README.md
```

## Demo Workflow

1. Create a new system from the Systems page
2. Click "Load Demo Data" to populate with sample hierarchy and DAs
3. Navigate to:
   - **Hierarchy Editor** - View/edit system structure (NEW: Obsidian Canvas UI)
   - **DA Manager** - Manage Design Alternatives and rate quality
   - **Compatibility** - Rate compatibility between DA pairs
   - **Optimization** - Run HMMD algorithm to find Pareto-efficient solutions
   - **Analysis** - View results with visualizations and export

## Hierarchy Editor - Obsidian Canvas UI

### Core Features
- **Free Positioning**: Drag nodes anywhere on canvas, positions saved to database
- **Inline Editing**: Click to edit name, description, tags, or type directly on node
- **Double-Click Canvas**: Create new nodes anywhere by double-clicking
- **Multi-Select**: Hold Shift + click to select multiple nodes
- **Groups**: Select 2+ nodes and click "Create Group" to group them
- **Connections**: Drag from handle to handle to create parent-child relationships
- **Visual Hierarchy**: Edges show parent-child relationships

### Node Types
- **System**: Top-level system node (blue)
- **Subsystem**: Major system divisions (green)
- **Module**: Functional modules (orange)
- **Component**: Leaf nodes with Design Alternatives (purple)
- **Group**: Container for organizing nodes (dark gray, semi-transparent)

### Keyboard Shortcuts
- **Enter**: Save inline edit
- **Escape**: Cancel inline edit
- **Shift+Click**: Multi-select nodes
- **Double-Click Canvas**: Create new node
- **Double-Click Node**: Create child node
- **Drag**: Move nodes freely

### Inline Editing
- **Name**: Click node name to edit, auto-saves on blur or Enter
- **Description**: Click description or "+ Add description" to edit
- **Tags**: Click tags or "+ Add tags" to manage tags inline
- **Type**: Click type badge to change via dropdown
- All edits auto-save to database

### Groups
- **Selection**: Select 2+ nodes using Shift+click
- **Create**: "Create Group" button appears when 2+ nodes selected
- **Behavior**: Creates group node, moves all selected nodes into it
- **Visual**: Dark semi-transparent background, larger size (400×200)
- **No Actions**: Groups don't have add/edit/delete buttons (organizational only)

## Key Features

### Implemented
- **Hierarchy Editor** (NEW: Obsidian Canvas UI):
  - Free node positioning with database persistence
  - Inline editing for all node properties
  - Double-click canvas to create nodes
  - Multi-select with Shift+click
  - Group creation for organizing nodes
  - Visual hierarchy connections (solid lines)
  - Bigger nodes (320×200) for better readability
  - Larger handles (20×20) with colored borders
  - Rounded corners throughout
  
- **Design Alternative Manager**:
  - CRUD operations for Design Alternatives
  - Quality rating with star-based ordinal scale (1-5)
  - Multiset estimates support (for advanced users)
  - Priority ordering
  - Filter by component

- **Quality Ratings**:
  - Multi-expert support (backend ready)
  - Star-based ordinal rating (1-5 stars)
  - Optional multiset estimates
  - Confidence scores
  - Expert management UI (use seed data for now)

- **Compatibility Editor** (FULLY CONNECTED TO API):
  - Matrix view of pairwise compatibility
  - Color-coded cells (red=bad, green=good)
  - Batch update support
  - Auto-save with refetch
  - Error handling and loading states

- **Optimization Page**:
  - HMMD algorithm implementation
  - Pareto frontier identification
  - Quality vector calculation
  - Configuration options

- **Analysis Page**:
  - Results table with all solutions
  - Pareto frontier visualization (D3.js)
  - Bar charts for criteria comparison
  - CSV export functionality

### Backend API
- Full CRUD operations for all entities
- PostgreSQL database with Prisma ORM
- RESTful API endpoints
- Proper error handling
- CORS configuration

### Demo Data
- Pre-loaded "Smart Home System" with 8 nodes
- Sample Design Alternatives for components
- Expert: "System Architect"
- Ready for immediate testing

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[00-overview.md](docs/00-overview.md)** - Project overview and quick start
- **[04-hmmd-method.md](docs/04-hmmd-method.md)** - Primary optimization method
- **[06-compatibility.md](docs/06-compatibility.md)** - Compatibility matrix details
- **[13-implementation-guide.md](docs/13-implementation-guide.md)** - Implementation details

## Technology Stack

### Frontend
- React 19 + TypeScript
- Vite 7 (build tool)
- Material-UI v7 (UI components)
- Zustand (state management)
- React Router v7 (routing)
- React Query (server state - ready)
- React Flow (canvas visualization)
- D3.js (data visualization)
- React Hook Form + Yup (forms & validation)

### Backend
- Node.js + Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- Zod (validation)
- Helmet (security)
- CORS

## API Endpoints

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/systems` | GET, POST | List/create systems |
| `/api/systems/:id` | GET, PUT, DELETE | CRUD single system |
| `/api/systems/:id/hierarchy` | GET, PUT | Get/replace hierarchy |
| `/api/systems/:id/hierarchy/nodes` | GET, POST, PUT, DELETE | Node CRUD |
| `/api/systems/:id/das` | GET, POST | List/create DAs |
| `/api/systems/:id/ratings` | GET, POST | List/submit ratings |
| `/api/systems/:id/compatibility` | GET, PUT | Compatibility ratings |
| `/api/systems/:id/solutions` | GET, POST, DELETE | Optimization solutions |
| `/api/health` | GET | Health check |

See `backend/README.md` for full API documentation.

## Methodology

Based on **"Modular System Design and Evaluation"** by Mark S. Levin (Springer, 2015):

- **HMMD Method**: Hierarchical Morphological Multicriteria Design
- **Quality Vector**: N(S) = (w(S), e(S)) where w = compatibility, e = quality distribution
- **Pareto Optimization**: Identify efficient solutions
- **Multi-Expert Aggregation**: Median-based rating aggregation

## Development Status

- **Frontend**: ✅ Core functionality complete, 0 TypeScript errors
- **Backend**: ✅ All APIs implemented, database configured
- **Integration**: ✅ Compatibility fully connected, others partial
- **Obsidian Canvas UI**: ✅ Fully implemented with all features
- **Testing**: ⚪ Manual testing complete, automated tests skipped (MVP scope)

## Planned / TODO

- **Optimization Save/Load**: Connect to backend API (in progress)
- **Analysis Page**: Full implementation with solution history
- **Multi-Expert Rating UI**: Replace seed data with full UI
- **Authentication**: User accounts and permissions (optional, post-MVP)
- **Performance**: Optimize large datasets and rendering (post-MVP)
- **Mobile**: Responsive design for tablets/phones (post-MVP)

## Contributing

Contributions are welcome! See "Planned / TODO" section for areas that need work.

## License

MIT

## References

- Levin, M. S. (2015). *Modular System Design and Evaluation*. Springer.
- [Implementation Guide](docs/13-implementation-guide.md)
