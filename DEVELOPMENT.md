# Development Guide

This document describes the current state of the project and provides guidance for continuing development.

## Current State (March 2026)

Both **frontend and backend are complete and functional**. The backend API provides full data persistence.

### What's Working

| Feature | Status | Location |
|---------|--------|----------|
| Hierarchy Editor | Complete | `frontend/pages/HierarchyEditor.tsx` |
| DA Manager | Complete | `frontend/pages/DAManager.tsx` |
| Quality Ratings | Complete | Integrated in DAManager |
| Compatibility Matrix | Complete | `frontend/pages/CompatibilityEditor.tsx` |
| HMMD Optimization | Complete | `frontend/pages/OptimizationPage.tsx` |
| Pareto Visualization | Complete | `frontend/pages/AnalysisPage.tsx` |
| CSV Export | Complete | Integrated in AnalysisPage |
| Demo Data | Complete | `frontend/data/demoHierarchy.ts` |
| **Backend API** | **Complete** | `backend/` |
| **Database Schema** | **Complete** | `backend/prisma/schema.prisma` |
| **API Client** | **Complete** | `frontend/src/api/` |

### What's Missing

| Feature | Priority | Notes |
|---------|----------|-------|
| Frontend-backend integration | High | Connect pages to API services |
| Multi-expert UI | Medium | Backend supports it, UI needed |
| Import from Excel | Medium | Manual entry only |
| Undo/Redo | Low | No version history |
| Authentication | Low | Single-user mode |

---

## Quick Start for Development

### Frontend
```bash
cd frontend
npm install
npm run dev
```

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

Frontend: `http://localhost:5173`
Backend API: `http://localhost:3001/api`

---

## Architecture Overview

```
├── frontend/           # React + TypeScript
│   ├── src/
│   │   ├── api/        # API client services
│   │   ├── components/ # UI components
│   │   ├── pages/      # Page components
│   │   ├── stores/     # Zustand state
│   │   └── types/      # TypeScript definitions
│   └── ...
├── backend/            # Express + TypeScript
│   ├── src/
│   │   ├── routes/     # API route handlers
│   │   ├── services/   # Prisma client
│   │   ├── middleware/ # Error handling, etc.
│   │   └── config/     # Environment config
│   └── prisma/
│       └── schema.prisma  # Database schema
└── docs/               # Documentation
```

---

## Backend API Reference

See `backend/README.md` for full API documentation.

### Key Endpoints

```
# Systems
GET/POST   /api/systems
GET/PUT/DEL /api/systems/:id

# Hierarchy
GET/PUT    /api/systems/:id/hierarchy
POST/GET/PUT/DEL /api/systems/:id/hierarchy/nodes/:nodeId

# Design Alternatives
GET/POST   /api/systems/:id/das
GET/PUT/DEL /api/systems/:id/das/:daId

# Ratings
GET/POST   /api/systems/:id/ratings
GET/POST/DEL /api/systems/:id/ratings/experts

# Compatibility
GET/PUT    /api/systems/:id/compatibility
GET        /api/systems/:id/compatibility/matrix/:c1/:c2

# Solutions
GET/POST/DEL /api/systems/:id/solutions
```

---

## Key Files to Understand

### Frontend State Management

**`frontend/stores/systemStore.ts`** - Main data store (currently in-memory)
```typescript
hierarchy: SystemNode[]
designAlternatives: DesignAlternative[]
ratings: Rating[]
compatibilityRatings: CompatibilityRating[]
```

**`frontend/stores/optimizationStore.ts`** - Optimization results
```typescript
solutions: Solution[]
paretoSolutions: Solution[]
isRunning: boolean
```

### Frontend API Services

**`frontend/src/api/`** - API client modules
- `systems.ts` - System CRUD
- `hierarchy.ts` - Hierarchy management
- `designAlternatives.ts` - DA management
- `ratings.ts` - Rating and expert management
- `compatibility.ts` - Compatibility matrix
- `solutions.ts` - Solution persistence

### Backend Routes

**`backend/src/routes/`** - API endpoints
- `systems.ts` - System CRUD
- `hierarchy.ts` - Hierarchy & nodes
- `designAlternatives.ts` - DA management
- `ratings.ts` - Ratings & experts
- `compatibility.ts` - Compatibility ratings
- `solutions.ts` - Solution persistence

### HMMD Algorithm

**`frontend/pages/OptimizationPage.tsx`** contains the complete algorithm:

```typescript
computeMinCompatibility(selections, compatRatings) → number
computeQualityDistribution(selections, das) → number[]
isDominated(solution, allSolutions) → boolean
cartesianProduct(arrays) → combinations
runOptimization() → async main loop
```

---

## Integrating Frontend with Backend

The API services are ready in `frontend/src/api/`. To connect:

1. **Replace in-memory store with API calls**
```typescript
// Instead of:
addDA: (da) => set((state) => ({ 
  designAlternatives: [...state.designAlternatives, da] 
}))

// Use:
const mutation = useMutation({
  mutationFn: (da) => designAlternativesApi.create(systemId, da),
  onSuccess: (newDA) => {
    queryClient.invalidateQueries({ queryKey: ['das', systemId] })
  }
})
```

2. **Add React Query for server state**
```typescript
// In App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

3. **Use in components**
```typescript
const { data: das } = useQuery({
  queryKey: ['das', systemId],
  queryFn: () => designAlternativesApi.list(systemId)
})
```

---

## Testing the Application

### Manual Testing Flow

1. **Start backend**: `cd backend && npm run dev`
2. **Start frontend**: `cd frontend && npm run dev`
3. **Create System**: Go to /systems, click "Create New System"
4. **Load Demo**: Click "Load Demo Data" on overview
5. **Check Hierarchy**: Click Hierarchy, verify tree displays
6. **Add DA**: Click DA Manager, select component, click "Add DA"
7. **Rate DA**: Click star icon on a DA card
8. **Edit Compatibility**: Click Compatibility, select two components
9. **Run Optimization**: Click Optimization, select all, click Run
10. **View Analysis**: Click Analysis, verify charts render
11. **Export CSV**: Click "Export CSV" button

### Backend Testing

```bash
# Health check
curl http://localhost:3001/api/health

# Create system
curl -X POST http://localhost:3001/api/systems \
  -H "Content-Type: application/json" \
  -d '{"name": "Test System"}'

# List systems
curl http://localhost:3001/api/systems
```

---

## Code Style

### Frontend
- **TypeScript**: Strict mode enabled
- **React**: Functional components with hooks
- **State**: Zustand stores (no Redux)
- **UI**: Material-UI v7 components
- **Routing**: React Router v7

### Backend
- **TypeScript**: Strict mode enabled
- **Framework**: Express.js
- **ORM**: Prisma
- **Validation**: Zod
- **Error Handling**: Custom error classes

---

## Deployment

### Frontend
```bash
cd frontend
npm run build
```
Output in `dist/`. Set `VITE_API_URL` environment variable.

### Backend
```bash
cd backend
npm run build
npm start
```
Set `DATABASE_URL` and `NODE_ENV=production`.

### Docker (Optional)
Create `docker-compose.yml` for PostgreSQL + backend.

---

## Architecture Decisions

### Why Zustand over Redux?
- Simpler API, less boilerplate
- Works well for medium-sized apps

### Why client-side optimization?
- Faster iteration during development
- Move to backend later for large systems

### Why React Flow for hierarchy?
- Built-in zoom/pan
- Node/edge management

### Why D3 for charts?
- Full control over visualization
- Industry standard for data viz

### Why Prisma over raw SQL?
- Type-safe database access
- Auto-generated types
- Easy migrations

### Why Express.js?
- Simple, well-documented
- Large ecosystem
- Easy to extend
