# MultiOoper Backend

Backend API server for the Multi-Objective Optimization Platform.

## Tech Stack

- **Node.js** + **TypeScript**
- **Express.js** - Web framework
- **Prisma** - ORM for PostgreSQL
- **Zod** - Runtime validation
- **Helmet** - Security headers
- **CORS** - Cross-origin support

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your database credentials

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# (Optional) Seed database with demo data
npm run db:seed

# Start development server
npm run dev
```

The API will be available at `http://localhost:3001/api`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |

## API Endpoints

### Systems
```
GET    /api/systems              # List all systems
POST   /api/systems              # Create system
GET    /api/systems/:id          # Get system
PUT    /api/systems/:id          # Update system
DELETE /api/systems/:id          # Delete system
```

### Hierarchy
```
GET    /api/systems/:systemId/hierarchy          # Get full hierarchy
PUT    /api/systems/:systemId/hierarchy          # Replace hierarchy
GET    /api/systems/:systemId/hierarchy/components  # Get components only
POST   /api/systems/:systemId/hierarchy/nodes    # Create node
GET    /api/systems/:systemId/hierarchy/nodes/:nodeId  # Get node
PUT    /api/systems/:systemId/hierarchy/nodes/:nodeId  # Update node
DELETE /api/systems/:systemId/hierarchy/nodes/:nodeId  # Delete node
```

### Design Alternatives
```
GET    /api/systems/:systemId/das                # List all DAs
POST   /api/systems/:systemId/das                # Create DA
POST   /api/systems/:systemId/das/bulk           # Bulk create DAs
GET    /api/systems/:systemId/das/by-component/:componentId  # DAs by component
GET    /api/systems/:systemId/das/:daId          # Get DA
PUT    /api/systems/:systemId/das/:daId          # Update DA
DELETE /api/systems/:systemId/das/:daId          # Delete DA
```

### Ratings
```
GET    /api/systems/:systemId/ratings            # List all ratings
POST   /api/systems/:systemId/ratings            # Submit rating
GET    /api/systems/:systemId/ratings/by-da/:daId  # Ratings for DA
GET    /api/systems/:systemId/ratings/aggregated  # Aggregated ratings
DELETE /api/systems/:systemId/ratings/:ratingId  # Delete rating

GET    /api/systems/:systemId/ratings/experts    # List experts
POST   /api/systems/:systemId/ratings/experts    # Create expert
DELETE /api/systems/:systemId/ratings/experts/:expertId  # Delete expert
```

### Compatibility
```
GET    /api/systems/:systemId/compatibility      # List all ratings
PUT    /api/systems/:systemId/compatibility      # Update rating
PUT    /api/systems/:systemId/compatibility/bulk # Bulk update
GET    /api/systems/:systemId/compatibility/matrix/:comp1Id/:comp2Id  # Get matrix
DELETE /api/systems/:systemId/compatibility/:id  # Delete rating
```

### Solutions
```
GET    /api/systems/:systemId/solutions          # List solutions
POST   /api/systems/:systemId/solutions          # Save all solutions
POST   /api/systems/:systemId/solutions/single   # Save single solution
GET    /api/systems/:systemId/solutions/stats    # Get statistics
GET    /api/systems/:systemId/solutions/:solutionId  # Get solution
DELETE /api/systems/:systemId/solutions/:solutionId  # Delete solution
DELETE /api/systems/:systemId/solutions          # Clear all solutions
```

### Health Check
```
GET    /api/health  # API health check
```

## Database Schema

See `prisma/schema.prisma` for the complete schema.

### Key Entities

- **System** - Top-level project container
- **SystemNode** - Hierarchy tree nodes (system, subsystem, module, component)
- **DesignAlternative** - DAs for components
- **Expert** - Domain experts who provide ratings
- **Rating** - Quality ratings for DAs
- **CompatibilityRating** - Pairwise compatibility between DAs
- **Solution** - Optimization results

## Development

```bash
# Run in development mode with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run Prisma Studio (database GUI)
npm run db:studio
```

## Error Handling

All errors return JSON in the format:
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": [] // For validation errors
}
```

Common error codes:
- `VALIDATION_ERROR` - Invalid request data
- `NOT_FOUND` - Resource not found
- `BAD_REQUEST` - Invalid operation
- `CONFLICT` - Duplicate resource
- `INTERNAL_ERROR` - Server error
