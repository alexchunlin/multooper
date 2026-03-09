import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../services/prisma.js';
import { NotFoundError, BadRequestError } from '../middleware/errorHandler.js';

const router = Router({ mergeParams: true });

// Type params
interface SystemParams { systemId: string; }
interface ComponentParams { systemId: string; componentId: string; }
interface DAParams { systemId: string; daId: string; }

// Validation schemas
const multisetEstimateSchema = z.object({
  l: z.number().int().positive(),
  eta: z.number().int().positive(),
  counts: z.array(z.number().int().nonnegative()),
}).refine((data) => data.counts.length === data.l, {
  message: 'counts array length must equal l',
});

const createDASchema = z.object({
  componentId: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  priority: z.number().int().positive().optional(),
  multisetEstimate: multisetEstimateSchema.optional(),
});

const updateDASchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  priority: z.number().int().positive().optional().nullable(),
  multisetEstimate: multisetEstimateSchema.optional().nullable(),
});

// Helper to verify system exists
async function verifySystemExists(systemId: string) {
  const system = await prisma.system.findUnique({ where: { id: systemId } });
  if (!system) {
    throw new NotFoundError('System');
  }
  return system;
}

// GET /api/systems/:systemId/das - List all DAs for system
router.get('/', async (req: Request<SystemParams>, res: Response) => {
  const { systemId } = req.params;
  await verifySystemExists(systemId);

  // Get all DAs for components in this system
  const das = await prisma.designAlternative.findMany({
    where: {
      component: {
        systemId,
      },
    },
    orderBy: [{ componentId: 'asc' }, { priority: 'asc' }, { name: 'asc' }],
    include: {
      component: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
      _count: {
        select: {
          ratings: true,
        },
      },
    },
  });

  res.json(das);
});

// GET /api/systems/:systemId/das/by-component/:componentId - List DAs for specific component
router.get('/by-component/:componentId', async (req: Request<ComponentParams>, res: Response) => {
  const { systemId, componentId } = req.params;

  // Verify component exists and belongs to system
  const component = await prisma.systemNode.findFirst({
    where: { id: componentId, systemId, type: 'component' },
  });

  if (!component) {
    throw new NotFoundError('Component');
  }

  const das = await prisma.designAlternative.findMany({
    where: { componentId },
    orderBy: [{ priority: 'asc' }, { name: 'asc' }],
    include: {
      _count: {
        select: {
          ratings: true,
        },
      },
    },
  });

  res.json(das);
});

// GET /api/systems/:systemId/das/:daId - Get single DA
router.get('/:daId', async (req: Request<DAParams>, res: Response) => {
  const { systemId, daId } = req.params;

  const da = await prisma.designAlternative.findFirst({
    where: {
      id: daId,
      component: {
        systemId,
      },
    },
    include: {
      component: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
      ratings: {
        include: {
          expert: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!da) {
    throw new NotFoundError('Design Alternative');
  }

  res.json(da);
});

// POST /api/systems/:systemId/das - Create new DA
router.post('/', async (req: Request<SystemParams>, res: Response) => {
  const { systemId } = req.params;
  const data = createDASchema.parse(req.body);

  // Verify component exists and belongs to system
  const component = await prisma.systemNode.findFirst({
    where: { id: data.componentId, systemId, type: 'component' },
  });

  if (!component) {
    throw new BadRequestError('Component not found in this system');
  }

  const da = await prisma.designAlternative.create({
    data: {
      componentId: data.componentId,
      name: data.name,
      description: data.description,
      priority: data.priority,
      multisetEstimate: data.multisetEstimate,
    },
    include: {
      component: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
    },
  });

  res.status(201).json(da);
});

// PUT /api/systems/:systemId/das/:daId - Update DA
router.put('/:daId', async (req: Request<DAParams>, res: Response) => {
  const { systemId, daId } = req.params;
  const data = updateDASchema.parse(req.body);

  // Check DA exists and belongs to system
  const existing = await prisma.designAlternative.findFirst({
    where: {
      id: daId,
      component: {
        systemId,
      },
    },
  });

  if (!existing) {
    throw new NotFoundError('Design Alternative');
  }

  const da = await prisma.designAlternative.update({
    where: { id: daId },
    data: {
      name: data.name,
      description: data.description,
      priority: data.priority,
      multisetEstimate: data.multisetEstimate === null ? undefined : data.multisetEstimate,
      version: { increment: 1 },
    },
    include: {
      component: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
    },
  });

  res.json(da);
});

// DELETE /api/systems/:systemId/das/:daId - Delete DA
router.delete('/:daId', async (req: Request<DAParams>, res: Response) => {
  const { systemId, daId } = req.params;

  const existing = await prisma.designAlternative.findFirst({
    where: {
      id: daId,
      component: {
        systemId,
      },
    },
  });

  if (!existing) {
    throw new NotFoundError('Design Alternative');
  }

  await prisma.designAlternative.delete({ where: { id: daId } });

  res.status(204).send();
});

// POST /api/systems/:systemId/das/bulk - Create multiple DAs
router.post('/bulk', async (req: Request<SystemParams>, res: Response) => {
  const { systemId } = req.params;
  const dasData = z.array(createDASchema).parse(req.body);

  // Verify all component IDs belong to system
  const componentIds = [...new Set(dasData.map((d) => d.componentId))];
  const components = await prisma.systemNode.findMany({
    where: {
      id: { in: componentIds },
      systemId,
      type: 'component',
    },
  });

  if (components.length !== componentIds.length) {
    throw new BadRequestError('One or more components not found in this system');
  }

  const das = await prisma.designAlternative.createMany({
    data: dasData.map((d) => ({
      componentId: d.componentId,
      name: d.name,
      description: d.description,
      priority: d.priority,
      multisetEstimate: d.multisetEstimate,
    })),
  });

  res.status(201).json({ created: das.count });
});

export default router;
