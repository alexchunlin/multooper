# Multi-Objective Optimization Frontend

A React-based web interface for multi-objective optimization of modular systems using the HMMD methodology.

## Tech Stack

- **React 19** with TypeScript
- **Vite 7** for build tooling
- **Material-UI (MUI) v7** for UI components
- **React Router v7** for routing
- **Zustand** for global state management
- **React Query** for server state (ready for backend)
- **React Flow** for hierarchy visualization
- **D3.js** for Pareto charts

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## Project Structure

```
src/
├── api/              # API client (ready for backend)
│   └── client.ts
├── components/       # React components
│   ├── common/       # Layout, Header, Sidebar
│   └── hierarchy/    # React Flow custom nodes
├── data/             # Demo data
│   └── demoHierarchy.ts
├── pages/            # Page components
│   ├── Dashboard.tsx
│   ├── SystemsList.tsx
│   ├── SystemOverview.tsx
│   ├── HierarchyEditor.tsx
│   ├── DAManager.tsx
│   ├── CompatibilityEditor.tsx
│   ├── OptimizationPage.tsx
│   ├── AnalysisPage.tsx
│   └── SettingsPage.tsx
├── stores/           # Zustand stores
│   ├── systemStore.ts      # Main data store
│   ├── optimizationStore.ts
│   └── uiStore.ts
├── types/            # TypeScript types
│   ├── system.ts
│   ├── da.ts
│   ├── rating.ts
│   ├── compatibility.ts
│   └── optimization.ts
├── App.tsx
└── main.tsx
```

## Features

### Implemented
- [x] Project setup with Vite + React + TypeScript
- [x] Basic layout and routing
- [x] Hierarchy tree editor (React Flow)
- [x] Design Alternative manager with CRUD
- [x] Rating interface (star-based ordinal + multiset)
- [x] Compatibility matrix editor
- [x] HMMD optimization engine
- [x] Pareto frontier visualization (D3.js)
- [x] CSV export
- [x] Demo data for testing

### TODO
- [ ] Backend API integration
- [ ] Data persistence (localStorage or backend)
- [ ] Multi-expert rating aggregation
- [ ] Import from Excel/CSV
- [ ] Bottleneck detection

## Key Components

### DAManager.tsx
Manages Design Alternatives for each component:
- Component selector sidebar
- DA cards with name, description, priority
- Star-based quality ratings with confidence slider
- Multiset estimate support for advanced ratings
- Add/Edit/Delete operations

### CompatibilityEditor.tsx
Compatibility matrix between DA pairs:
- Component pair selector dropdowns
- Color-coded cells (0=red to 3=green)
- Click-to-edit with slider
- Batch fill operations

### OptimizationPage.tsx
HMMD algorithm implementation:
- Multi-select components to optimize
- Minimum compatibility threshold
- Real-time progress indicator
- Results table with quality vectors

### AnalysisPage.tsx
Results visualization:
- Pareto frontier scatter plot (D3.js)
- Quality distribution bar chart
- Statistics summary
- Top solutions table
- CSV export

## State Management

### systemStore (Zustand)
Main data store containing:
- `hierarchy: SystemNode[]` - Tree structure
- `designAlternatives: DesignAlternative[]` - All DAs
- `ratings: Rating[]` - Quality ratings
- `compatibilityRatings: CompatibilityRating[]` - Pairwise compatibility

### optimizationStore (Zustand)
Optimization results:
- `solutions: Solution[]` - All feasible solutions
- `paretoSolutions: Solution[]` - Pareto-efficient subset
- `isRunning: boolean` - Computation in progress
- `progress: number` - 0-100 percentage

## Environment Variables

Create a `.env` file (optional, for future backend):

```
VITE_API_URL=http://localhost:3001/api
```

## Docker Browser Testing

The Vite config is set up for Docker-based browser testing:
```typescript
server: {
  host: '0.0.0.0',
  port: 5173,
  allowedHosts: ['host.docker.internal', 'localhost'],
}
```

## License

MIT
