# Agent Guide for MultiOoper Development

This document contains critical information for coding agents working on this project.

---

## Testing the Web Application

### Docker/Playwright Browser Limitations

**Problem**: The MCP_DOCKER Playwright browser runs inside a Docker container. It **cannot access `localhost`** URLs from the host machine.

**Solution**: Use the host machine's network IP address instead of `localhost`.

```bash
# Get your local IP
ipconfig getifaddr en0  # macOS
# or
hostname -I             # Linux

# Then navigate to that IP instead of localhost
# Wrong: http://localhost:5173
# Right: http://192.168.10.25:5173
```

**Verification**:
```bash
# First verify the server is accessible from host
curl http://localhost:5173 | head -10

# Then use the IP in browser navigation
```

### Starting Development Servers

```bash
# Backend (port 3001)
cd backend && npm run dev

# Frontend (port 5173)
cd frontend && npm run dev

# Check if ports are in use
lsof -i :3001 -i :5173
```

If ports are already in use, the servers may still be running from a previous session. Check with `curl http://localhost:3001/api/health`.

### Environment Configuration & Process Management

**Dual Environment Setup**:
- **Agents** must use Docker browser (`host.docker.internal`) - cannot access `localhost`
- **User** tests via regular browser - must use `localhost`

**Switching Environments**:
```bash
# Before testing with Docker browser
cd frontend && npm run env:docker

# After testing - ALWAYS restore browser mode
cd frontend && npm run env:browser
```

**Process Cleanup**:
```bash
# Kill zombie backend processes
cd backend && npm run cleanup

# Check for orphaned processes
ps aux | grep "tsx watch"

# Kill manually if needed
pkill -f "tsx watch.*backend"
```

**Critical Rules**:
1. ALWAYS leave the app in browser-ready state (`npm run env:browser`)
2. NEVER leave zombie `tsx watch` processes running
3. Properly stop servers with Ctrl+C, not by killing terminal
4. Before ending a session, verify: `curl http://localhost:3001/api/health`

---

## Project Architecture

### Tech Stack
- **Frontend**: React 19 + TypeScript + Vite + MUI v7 + React Flow + TanStack Query
- **Backend**: Express + TypeScript + Prisma + PostgreSQL
- **State**: Zustand stores (systemStore, optimizationStore) + React Query for server state

### Key Patterns

1. **API Hooks** (`frontend/src/hooks/useApi.ts`):
   - All API calls go through hooks, not direct axios calls
   - Uses TanStack Query for caching and invalidation
   - Pattern: `useResource()`, `useCreateResource()`, `useUpdateResource()`, `useDeleteResource()`

2. **System Context**:
   - `currentSystemId` in `useSystemStore()` tracks active system
   - Most pages require a system to be selected
   - URL params (`useParams`) sync with store state

3. **React Flow for Hierarchy**:
   - Custom nodes in `frontend/src/components/hierarchy/CustomNode.tsx`
   - Position stored in database (x, y fields on SystemNode)
   - Use `screenToFlowPosition()` for coordinate conversion

---

## Recommended Tools & Approaches

### For Code Exploration

| Task | Recommended Tool | Why |
|------|------------------|-----|
| Find files by name | `glob` | Fast pattern matching |
| Search file contents | `grep` | Regex support, shows line numbers |
| Read specific files | `read` | Gets full context with line numbers |
| Understand codebase | `Task` with `explore` agent | Parallel exploration, thoroughness levels |

### For Making Changes

| Task | Recommended Tool | Why |
|------|------------------|-----|
| Edit existing files | `edit` | Preserves formatting, requires read first |
| Create new files | `write` | Full control over content |
| Run commands | `bash` | Git, npm, builds, tests |

### For Git Operations

```bash
# Always check status before committing
git status
git diff --stat

# View recent history
git log --oneline -10

# Check current branch
git branch
```

---

## Getting Different Levels of Detail

### Quick Overview (1-2 minutes)
```bash
# Read main documentation
read MVP_PROGRESS.md

# Check git status
git status && git log --oneline -5
```

### Medium Detail (5-10 minutes)
```bash
# Read key files in parallel
read frontend/src/hooks/useApi.ts
read frontend/src/stores/systemStore.ts
read backend/src/routes/hierarchy.ts

# Search for patterns
grep "useSystemStore" frontend/src
```

### Deep Dive (15-30 minutes)
Use the Task tool with `explore` agent:
```
Task with prompt: "Explore the optimization workflow in this codebase. 
Trace from OptimizationPage.tsx through the API to the backend and database.
Include all files involved, data flow, and key functions."
```

---

## Common Pitfalls

### 1. Editing Without Reading First
The `edit` tool requires reading the file first. Always use `read` before `edit`.

### 2. TypeScript Build Errors
```bash
# Always verify the build after changes
cd frontend && npm run build
cd backend && npm run build
```

### 3. Stale React Flow Nodes
When node data changes, React Flow may not re-render. Use refs for callback functions passed to nodes:
```typescript
const handleUpdateNodeRef = useRef(handleUpdateNode);
useEffect(() => {
  handleUpdateNodeRef.current = handleUpdateNode;
});
```

### 4. MUI Select vs TextField Select
For dropdowns that need to open programmatically, use `Select` component directly, not `TextField select`:
```typescript
// Wrong - can't control open state
<TextField select ... />

// Right - can control with `open` prop
<Select open={isOpen} onClose={() => setIsOpen(false)} ... />
```

### 5. Coordinate Systems in React Flow
- `event.clientX/clientY` - screen coordinates
- `reactFlowInstance.screenToFlowPosition()` - converts to canvas coordinates
- `reactFlowInstance.project()` - older API, prefer `screenToFlowPosition()`

---

## Testing Checklist

After making changes, verify:

1. **Build**: `npm run build` in both frontend and backend
2. **Servers**: Both start without errors
3. **Health check**: `curl http://localhost:3001/api/health`
4. **UI Test**: Navigate to app, test affected features
5. **Console**: Check for errors in browser dev tools

---

## File Organization

```
multiOoper/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # useApi.ts - all API hooks
│   │   ├── pages/          # Route-level components
│   │   ├── stores/         # Zustand stores
│   │   └── types/          # TypeScript interfaces
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── routes/         # Express route handlers
│   │   └── config/         # Database, env config
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── package.json
├── MVP_PROGRESS.md         # Development progress tracking
└── AGENTS.md               # This file
```

---

## Communication Style

When working on this project:
- Be concise - output appears in a CLI
- No emojis unless requested
- No preamble/postamble ("Here is...", "I've completed...")
- Use `file_path:line_number` format for code references
- Batch parallel operations (multiple reads, multiple tool calls)

---

## Database Operations

```bash
cd backend

# Run migrations
npx prisma migrate dev --name description

# View database
npx prisma studio

# Reseed data
npm run db:seed
```

The database must be running (PostgreSQL) before the backend will start.
