# Multi-Objective Optimization Platform

A web-based platform for multi-objective optimization of modular systems, based on the HMMD (Hierarchical Morphological Multicriteria Design) methodology.

## Overview

This platform replaces Excel sheets and custom Python scripts with a comprehensive web interface for:
- Designing system hierarchies
- Managing Design Alternatives (DAs)
- Collecting multi-expert ratings
- Running optimization algorithms
- Visualizing Pareto-efficient solutions

## Architecture

```
├── frontend/          # React + TypeScript web interface
│   ├── src/
│   │   ├── api/          # API client services
│   │   ├── components/   # UI components
│   │   ├── pages/        # Page components
│   │   ├── stores/       # State management
│   │   ├── data/         # Demo data
│   │   └── types/        # TypeScript definitions
│   └── ...
├── backend/           # Node.js + Express API server
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── middleware/   # Error handling, etc.
│   │   ├── services/     # Prisma client
│   │   └── config/       # Environment config
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   └── ...
├── docs/              # Documentation
│   ├── 00-overview.md
│   ├── 04-hmmd-method.md
│   ├── 13-implementation-guide.md
│   └── ...
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+

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

### Full Stack

Run both frontend and backend:

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

## Demo Workflow

1. Create a new system from the Systems page
2. Click "Load Demo Data" to populate with sample hierarchy and DAs
3. Navigate to:
   - **Hierarchy Editor** - View/edit the system structure
   - **DA Manager** - Manage Design Alternatives and rate quality
   - **Compatibility** - Rate compatibility between DA pairs
   - **Optimization** - Run HMMD algorithm to find Pareto-efficient solutions
   - **Analysis** - View results with visualizations and export

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[00-overview.md](docs/00-overview.md)** - Project overview and quick start
- **[04-hmmd-method.md](docs/04-hmmd-method.md)** - Primary optimization method
- **[06-compatibility.md](docs/06-compatibility.md)** - Compatibility matrix details
- **[13-implementation-guide.md](docs/13-implementation-guide.md)** - Implementation details

## Key Features

### Implemented
- Hierarchy tree editor (React Flow)
- Design Alternative manager with CRUD operations
- Quality rating interface (star-based ordinal + multiset estimates)
- Compatibility matrix editor with color-coded cells
- HMMD optimization engine (client-side)
- Pareto frontier visualization (D3.js)
- CSV export functionality
- Demo data for testing
- **Backend API with full CRUD operations**
- **PostgreSQL database with Prisma ORM**
- **Multi-expert rating support (backend ready)**

### Planned / TODO
- Frontend-backend integration (connect UI to API)
- Multi-expert rating UI
- Bottleneck detection and improvement suggestions
- Advanced filtering and constraints
- Import from Excel/CSV
- User authentication (optional)

## Technology Stack

### Frontend
- React 19 + TypeScript
- Vite 7 (build tool)
- Material-UI v7
- React Router v7
- Zustand (state management)
- React Query (server state - ready for backend)
- D3.js + React Flow (visualizations)
- React Hook Form + Yup (forms)

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
| `/api/systems/:id/das` | GET, POST | List/create DAs |
| `/api/systems/:id/ratings` | GET, POST | List/submit ratings |
| `/api/systems/:id/compatibility` | GET, PUT | Compatibility ratings |
| `/api/systems/:id/solutions` | GET, POST, DELETE | Optimization solutions |
| `/api/health` | GET | Health check |

See `backend/README.md` for full API documentation.

## Methodology

Based on **"Modular System Design and Evaluation"** by Mark Sh. Levin (Springer, 2015):

- **HMMD Method**: Hierarchical Morphological Multicriteria Design
- **Quality Vector**: N(S) = (w(S), e(S)) where w = compatibility, e = quality distribution
- **Pareto Optimization**: Identify efficient solutions
- **Multi-Expert Aggregation**: Median-based rating aggregation

## Development Status

The **frontend and backend core functionality is complete**. 

**Next priority**: Connect frontend pages to backend API services.

## Contributing

Contributions are welcome! See the "Planned / TODO" section for areas that need work.

## License

MIT

## References

- Levin, M. S. (2015). *Modular System Design and Evaluation*. Springer.
- [Implementation Guide](docs/13-implementation-guide.md)
