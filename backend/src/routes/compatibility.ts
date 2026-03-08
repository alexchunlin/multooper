import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../services/prisma.js';
import { NotFoundError, BadRequestError } from '../middleware/errorHandler.js';

const router = Router({ mergeParams: true });

// Type params
interface SystemParams { systemId: string; }
interface MatrixParams { systemId: string; comp1Id: string; comp2Id: string; }
interface IdParams { systemId: string; id: string; }

// Validation schemas
const updateCompatibilitySchema = z.object({
  da1Id: z.string().uuid(),
  da2Id: z.string().uuid(),
  value: z.number().int().min(0).max(5), // 0=incompatible, 1-3=levels, etc.
  expertId: z.string().uuid().optional(),
});

const bulkCompatibilitySchema = z.array(updateCompatibilitySchema);

// Helper to verify system exists
async function verifySystemExists(systemId: string) {
  const system = await prisma.system.findUnique({ where: { id: systemId } });
  if (!system) {
    throw new NotFoundError('System');
  }
  return system;
}

// Helper to normalize DA pair (always store with smaller ID first)
function normalizePair(da1Id: string, da2Id: string): [string, string] {
  return da1Id < da2Id ? [da1Id, da2Id] : [da2Id, da1Id];
}

// GET /api/systems/:systemId/compatibility - Get all compatibility ratings
router.get('/', async (req: Request<SystemParams>, res: Response) => {
  const { systemId } = req.params;
  await verifySystemExists(systemId);

  const ratings = await prisma.compatibilityRating.findMany({
    where: {
      da1: {
        component: {
          systemId,
        },
      },
    },
    orderBy: { timestamp: 'desc' },
    include: {
      da1: {
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
      da2: {
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
  });

  res.json(ratings);
});

// GET /api/systems/:systemId/compatibility/matrix/:comp1Id/:comp2Id - Get matrix for two components
router.get('/matrix/:comp1Id/:comp2Id', async (req: Request<MatrixParams>, res: Response) => {
  const { systemId, comp1Id, comp2Id } = req.params;

  // Verify components exist
  const components = await prisma.systemNode.findMany({
    where: {
      id: { in: [comp1Id, comp2Id] },
      systemId,
      type: 'component',
    },
    include: {
      designAlternatives: {
        select: {
          id: true,
          name: true,
        },
        orderBy: { name: 'asc' },
      },
    },
  });

  if (components.length !== 2) {
    throw new NotFoundError('One or both components');
  }

  const [component1, component2] = comp1Id < comp2Id
    ? [components.find(c => c.id === comp1Id)!, components.find(c => c.id === comp2Id)!]
    : [components.find(c => c.id === comp2Id)!, components.find(c => c.id === comp1Id)!];

  // Get all DA IDs for both components
  const da1Ids = component1.designAlternatives.map(d => d.id);
  const da2Ids = component2.designAlternatives.map(d => d.id);

  // Get existing compatibility ratings between these DAs
  const ratings = await prisma.compatibilityRating.findMany({
    where: {
      OR: [
        { da1Id: { in: da1Ids }, da2Id: { in: da2Ids } },
        { da1Id: { in: da2Ids }, da2Id: { in: da1Ids } },
      ],
    },
  });

  // Build lookup map
  const ratingMap = new Map<string, number>();
  for (const r of ratings) {
    const [a, b] = normalizePair(r.da1Id, r.da2Id);
    ratingMap.set(`${a}:${b}`, r.value);
  }

  // Build matrix
  const matrix = {
    componentAId: component1.id,
    componentAName: component1.name,
    componentBId: component2.id,
    componentBName: component2.name,
    rows: component1.designAlternatives,
    columns: component2.designAlternatives,
    cells: component1.designAlternatives.map(row => 
      component2.designAlternatives.map(col => {
        const [a, b] = normalizePair(row.id, col.id);
        return {
          da1Id: row.id,
          da2Id: col.id,
          value: ratingMap.get(`${a}:${b}`) ?? 3, // Default to 3 (neutral/good)
        };
      })
    ),
  };

  res.json(matrix);
});

// PUT /api/systems/:systemId/compatibility - Update single compatibility rating
router.put('/', async (req: Request<SystemParams>, res: Response) => {
  const { systemId } = req.params;
  const data = updateCompatibilitySchema.parse(req.body);

  // Normalize pair
  const [da1Id, da2Id] = normalizePair(data.da1Id, data.da2Id);

  // Verify both DAs exist and belong to this system
  const das = await prisma.designAlternative.findMany({
    where: {
      id: { in: [da1Id, da2Id] },
      component: {
        systemId,
      },
    },
  });

  if (das.length !== 2) {
    throw new BadRequestError('One or both Design Alternatives not found in this system');
  }

  // Verify DAs are from different components
  if (das[0].componentId === das[1].componentId) {
    throw new BadRequestError('Compatibility ratings are only for DAs from different components');
  }

  // Build expert ratings JSON if expert provided
  let expertRatings: Record<string, number> | undefined;
  if (data.expertId) {
    // Get existing rating to merge
    const existing = await prisma.compatibilityRating.findUnique({
      where: { da1Id_da2Id: { da1Id, da2Id } },
    });
    expertRatings = {
      ...(existing?.expertRatings as Record<string, number> || {}),
      [data.expertId]: data.value,
    };
  }

  // Upsert compatibility rating
  const rating = await prisma.compatibilityRating.upsert({
    where: {
      da1Id_da2Id: { da1Id, da2Id },
    },
    update: {
      value: data.value,
      expertRatings: expertRatings ?? undefined,
      timestamp: new Date(),
      version: { increment: 1 },
    },
    create: {
      da1Id,
      da2Id,
      value: data.value,
      expertRatings,
    },
    include: {
      da1: {
        select: {
          id: true,
          name: true,
        },
      },
      da2: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  res.json(rating);
});

// PUT /api/systems/:systemId/compatibility/bulk - Bulk update compatibility ratings
router.put('/bulk', async (req: Request<SystemParams>, res: Response) => {
  const { systemId } = req.params;
  const ratings = bulkCompatibilitySchema.parse(req.body);

  // Collect all unique DA IDs
  const allDaIds = [...new Set(ratings.flatMap(r => [r.da1Id, r.da2Id]))];

  // Verify all DAs exist and belong to this system
  const das = await prisma.designAlternative.findMany({
    where: {
      id: { in: allDaIds },
      component: {
        systemId,
      },
    },
    select: {
      id: true,
      componentId: true,
    },
  });

  const daMap = new Map(das.map(d => [d.id, d.componentId]));

  if (das.length !== allDaIds.length) {
    throw new BadRequestError('One or more Design Alternatives not found in this system');
  }

  // Process all ratings in transaction
  const results = await prisma.$transaction(
    ratings.map((r) => {
      const [da1Id, da2Id] = normalizePair(r.da1Id, r.da2Id);

      // Verify different components
      if (daMap.get(da1Id) === daMap.get(da2Id)) {
        throw new BadRequestError(
          `DAs ${da1Id} and ${da2Id} are from the same component`
        );
      }

      return prisma.compatibilityRating.upsert({
        where: {
          da1Id_da2Id: { da1Id, da2Id },
        },
        update: {
          value: r.value,
          timestamp: new Date(),
          version: { increment: 1 },
        },
        create: {
          da1Id,
          da2Id,
          value: r.value,
        },
      });
    })
  );

  res.json({ updated: results.length });
});

// DELETE /api/systems/:systemId/compatibility/:id
router.delete('/:id', async (req: Request<IdParams>, res: Response) => {
  const { systemId, id } = req.params;

  const existing = await prisma.compatibilityRating.findFirst({
    where: {
      id,
      da1: {
        component: {
          systemId,
        },
      },
    },
  });

  if (!existing) {
    throw new NotFoundError('Compatibility Rating');
  }

  await prisma.compatibilityRating.delete({ where: { id } });

  res.status(204).send();
});

export default router;
