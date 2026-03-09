import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../services/prisma.js';
import { NotFoundError } from '../middleware/errorHandler.js';

const router = Router({ mergeParams: true });

// Type params
interface SystemParams { systemId: string; }
interface SolutionParams { systemId: string; solutionId: string; }

// Validation schemas
const saveSolutionSchema = z.object({
  name: z.string().max(100).optional(),
  selections: z.record(z.string().uuid(), z.string().uuid()), // componentId -> daId
  qualityVector: z.object({
    w: z.number(),
    e: z.array(z.number()),
    wLabel: z.string(),
    eLabel: z.string(),
  }),
  isParetoEfficient: z.boolean(),
  paretoRank: z.number().int().positive().optional(),
});

const saveBulkSolutionsSchema = z.array(saveSolutionSchema);

// Helper to verify system exists
async function verifySystemExists(systemId: string) {
  const system = await prisma.system.findUnique({ where: { id: systemId } });
  if (!system) {
    throw new NotFoundError('System');
  }
  return system;
}

// GET /api/systems/:systemId/solutions - Get all solutions
router.get('/', async (req: Request<SystemParams, unknown, unknown, { paretoOnly?: string }>, res: Response) => {
  const { systemId } = req.params;
  const { paretoOnly } = req.query;

  await verifySystemExists(systemId);

  const solutions = await prisma.solution.findMany({
    where: {
      systemId,
      ...(paretoOnly === 'true' && { isParetoEfficient: true }),
    },
    orderBy: [
      { isParetoEfficient: 'desc' },
      { paretoRank: 'asc' },
      { createdAt: 'desc' },
    ],
    include: {
      selections: {
        include: {
          da: {
            select: {
              id: true,
              name: true,
              componentId: true,
            },
          },
        },
      },
    },
  });

  // Transform to match frontend format
  const transformed = solutions.map((s) => ({
    id: s.id,
    systemId: s.systemId,
    name: s.name,
    selections: Object.fromEntries(
      s.selections.map((sel) => [sel.componentId, sel.daId])
    ),
    qualityVector: s.qualityVector,
    isParetoEfficient: s.isParetoEfficient,
    paretoRank: s.paretoRank,
    createdAt: s.createdAt,
    version: s.version,
  }));

  res.json(transformed);
});

// GET /api/systems/:systemId/solutions/stats - Get solution statistics
// NOTE: This route must come BEFORE /:solutionId to avoid conflicts
router.get('/stats', async (req: Request<SystemParams>, res: Response) => {
  const { systemId } = req.params;
  await verifySystemExists(systemId);

  const [total, pareto, latestRun] = await Promise.all([
    prisma.solution.count({ where: { systemId } }),
    prisma.solution.count({ where: { systemId, isParetoEfficient: true } }),
    prisma.solution.findFirst({
      where: { systemId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    }),
  ]);

  res.json({
    totalSolutions: total,
    paretoSolutions: pareto,
    lastRunAt: latestRun?.createdAt || null,
  });
});

// GET /api/systems/:systemId/solutions/:solutionId - Get single solution
router.get('/:solutionId', async (req: Request<SolutionParams>, res: Response) => {
  const { systemId, solutionId } = req.params;

  const solution = await prisma.solution.findFirst({
    where: { id: solutionId, systemId },
    include: {
      selections: {
        include: {
          da: {
            select: {
              id: true,
              name: true,
              componentId: true,
              component: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!solution) {
    throw new NotFoundError('Solution');
  }

  res.json({
    id: solution.id,
    systemId: solution.systemId,
    name: solution.name,
    selections: Object.fromEntries(
      solution.selections.map((sel) => [sel.componentId, sel.daId])
    ),
    selectionDetails: solution.selections.map((sel) => ({
      componentId: sel.componentId,
      componentName: sel.da.component.name,
      daId: sel.daId,
      daName: sel.da.name,
    })),
    qualityVector: solution.qualityVector,
    isParetoEfficient: solution.isParetoEfficient,
    paretoRank: solution.paretoRank,
    createdAt: solution.createdAt,
    version: solution.version,
  });
});

// POST /api/systems/:systemId/solutions - Save solutions (typically after optimization)
router.post('/', async (req: Request<SystemParams>, res: Response) => {
  const { systemId } = req.params;
  const solutions = saveBulkSolutionsSchema.parse(req.body);

  await verifySystemExists(systemId);

  // Transaction to save all solutions
  const result = await prisma.$transaction(async (tx) => {
    // Clear existing solutions for this system
    await tx.solutionSelection.deleteMany({
      where: {
        solution: { systemId },
      },
    });
    await tx.solution.deleteMany({
      where: { systemId },
    });

    // Create new solutions
    const createdSolutions = [];

    for (const sol of solutions) {
      const created = await tx.solution.create({
        data: {
          systemId,
          name: sol.name,
          qualityVector: sol.qualityVector,
          isParetoEfficient: sol.isParetoEfficient,
          paretoRank: sol.paretoRank,
          selections: {
            create: Object.entries(sol.selections).map(([componentId, daId]) => ({
              componentId,
              daId,
            })),
          },
        },
        include: {
          selections: true,
        },
      });

      createdSolutions.push(created);
    }

    return createdSolutions;
  });

  res.status(201).json({
    saved: result.length,
    paretoCount: result.filter((s) => s.isParetoEfficient).length,
  });
});

// POST /api/systems/:systemId/solutions/single - Save single solution
router.post('/single', async (req: Request<SystemParams>, res: Response) => {
  const { systemId } = req.params;
  const data = saveSolutionSchema.parse(req.body);

  await verifySystemExists(systemId);

  const solution = await prisma.solution.create({
    data: {
      systemId,
      name: data.name,
      qualityVector: data.qualityVector,
      isParetoEfficient: data.isParetoEfficient,
      paretoRank: data.paretoRank,
      selections: {
        create: Object.entries(data.selections).map(([componentId, daId]) => ({
          componentId,
          daId,
        })),
      },
    },
    include: {
      selections: {
        include: {
          da: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  res.status(201).json(solution);
});

// DELETE /api/systems/:systemId/solutions - Clear all solutions
router.delete('/', async (req: Request<SystemParams>, res: Response) => {
  const { systemId } = req.params;
  await verifySystemExists(systemId);

  await prisma.$transaction([
    prisma.solutionSelection.deleteMany({
      where: {
        solution: { systemId },
      },
    }),
    prisma.solution.deleteMany({
      where: { systemId },
    }),
  ]);

  res.status(204).send();
});

// DELETE /api/systems/:systemId/solutions/:solutionId - Delete single solution
router.delete('/:solutionId', async (req: Request<SolutionParams>, res: Response) => {
  const { systemId, solutionId } = req.params;

  const existing = await prisma.solution.findFirst({
    where: { id: solutionId, systemId },
  });

  if (!existing) {
    throw new NotFoundError('Solution');
  }

  await prisma.solution.delete({ where: { id: solutionId } });

  res.status(204).send();
});

export default router;
