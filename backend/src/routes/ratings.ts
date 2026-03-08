import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../services/prisma.js';
import { NotFoundError, BadRequestError } from '../middleware/errorHandler.js';

const router = Router({ mergeParams: true });

// Type params
interface SystemParams { systemId: string; }
interface ExpertParams { systemId: string; expertId: string; }
interface DAParams { systemId: string; daId: string; }
interface RatingParams { systemId: string; ratingId: string; }

// Validation schemas
const multisetValueSchema = z.object({
  l: z.number().int().positive(),
  eta: z.number().int().positive(),
  counts: z.array(z.number().int().nonnegative()),
});

const submitRatingSchema = z.object({
  daId: z.string().uuid(),
  expertId: z.string().uuid(),
  ordinalValue: z.number().int().min(1).max(10).optional(),
  multisetValue: multisetValueSchema.optional(),
  confidence: z.number().min(0).max(1).optional(),
  notes: z.string().max(500).optional(),
});

const createExpertSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().optional(),
  expertise: z.array(z.string()).optional(),
  weight: z.number().min(0).max(1).optional(),
});

// Helper to verify system exists
async function verifySystemExists(systemId: string) {
  const system = await prisma.system.findUnique({ where: { id: systemId } });
  if (!system) {
    throw new NotFoundError('System');
  }
  return system;
}

// ===============================
// EXPERTS
// ===============================

// GET /api/systems/:systemId/experts - List experts
router.get('/experts', async (req: Request<SystemParams>, res: Response) => {
  const { systemId } = req.params;
  await verifySystemExists(systemId);

  const experts = await prisma.expert.findMany({
    where: { systemId },
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: {
          ratings: true,
        },
      },
    },
  });

  res.json(experts);
});

// POST /api/systems/:systemId/experts - Create expert
router.post('/experts', async (req: Request<SystemParams>, res: Response) => {
  const { systemId } = req.params;
  await verifySystemExists(systemId);

  const data = createExpertSchema.parse(req.body);

  const expert = await prisma.expert.create({
    data: {
      systemId,
      name: data.name,
      email: data.email,
      expertise: data.expertise || [],
      weight: data.weight || 1.0,
    },
  });

  res.status(201).json(expert);
});

// DELETE /api/systems/:systemId/experts/:expertId
router.delete('/experts/:expertId', async (req: Request<ExpertParams>, res: Response) => {
  const { systemId, expertId } = req.params;

  const existing = await prisma.expert.findFirst({
    where: { id: expertId, systemId },
  });

  if (!existing) {
    throw new NotFoundError('Expert');
  }

  await prisma.expert.delete({ where: { id: expertId } });

  res.status(204).send();
});

// ===============================
// RATINGS
// ===============================

// GET /api/systems/:systemId/ratings - List all ratings
router.get('/', async (req: Request<SystemParams>, res: Response) => {
  const { systemId } = req.params;
  await verifySystemExists(systemId);

  const ratings = await prisma.rating.findMany({
    where: {
      da: {
        component: {
          systemId,
        },
      },
    },
    orderBy: { timestamp: 'desc' },
    include: {
      expert: {
        select: {
          id: true,
          name: true,
        },
      },
      da: {
        select: {
          id: true,
          name: true,
          componentId: true,
        },
      },
    },
  });

  res.json(ratings);
});

// GET /api/systems/:systemId/ratings/by-da/:daId - Ratings for specific DA
router.get('/by-da/:daId', async (req: Request<DAParams>, res: Response) => {
  const { systemId, daId } = req.params;

  // Verify DA exists in system
  const da = await prisma.designAlternative.findFirst({
    where: {
      id: daId,
      component: {
        systemId,
      },
    },
  });

  if (!da) {
    throw new NotFoundError('Design Alternative');
  }

  const ratings = await prisma.rating.findMany({
    where: { targetId: daId },
    orderBy: { timestamp: 'desc' },
    include: {
      expert: {
        select: {
          id: true,
          name: true,
          weight: true,
        },
      },
    },
  });

  res.json(ratings);
});

// POST /api/systems/:systemId/ratings - Submit rating
router.post('/', async (req: Request<SystemParams>, res: Response) => {
  const { systemId } = req.params;
  const data = submitRatingSchema.parse(req.body);

  // Verify DA exists in system
  const da = await prisma.designAlternative.findFirst({
    where: {
      id: data.daId,
      component: {
        systemId,
      },
    },
  });

  if (!da) {
    throw new BadRequestError('Design Alternative not found in this system');
  }

  // Verify expert exists in system
  const expert = await prisma.expert.findFirst({
    where: { id: data.expertId, systemId },
  });

  if (!expert) {
    throw new BadRequestError('Expert not found in this system');
  }

  // Upsert rating (update if exists, create if not)
  const rating = await prisma.rating.upsert({
    where: {
      expertId_targetId_targetType: {
        expertId: data.expertId,
        targetId: data.daId,
        targetType: 'DA',
      },
    },
    update: {
      ordinalValue: data.ordinalValue,
      multisetValue: data.multisetValue,
      confidence: data.confidence,
      notes: data.notes,
      timestamp: new Date(),
    },
    create: {
      expertId: data.expertId,
      targetId: data.daId,
      targetType: 'DA',
      ordinalValue: data.ordinalValue,
      multisetValue: data.multisetValue,
      confidence: data.confidence,
      notes: data.notes,
    },
    include: {
      expert: {
        select: {
          id: true,
          name: true,
        },
      },
      da: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  res.status(201).json(rating);
});

// DELETE /api/systems/:systemId/ratings/:ratingId
router.delete('/:ratingId', async (req: Request<RatingParams>, res: Response) => {
  const { systemId, ratingId } = req.params;

  const existing = await prisma.rating.findFirst({
    where: {
      id: ratingId,
      da: {
        component: {
          systemId,
        },
      },
    },
  });

  if (!existing) {
    throw new NotFoundError('Rating');
  }

  await prisma.rating.delete({ where: { id: ratingId } });

  res.status(204).send();
});

// GET /api/systems/:systemId/ratings/aggregated - Get aggregated ratings per DA
router.get('/aggregated', async (req: Request<SystemParams>, res: Response) => {
  const { systemId } = req.params;
  await verifySystemExists(systemId);

  // Get all DAs with their ratings
  const das = await prisma.designAlternative.findMany({
    where: {
      component: {
        systemId,
      },
    },
    include: {
      ratings: {
        include: {
          expert: {
            select: {
              weight: true,
            },
          },
        },
      },
    },
  });

  // Compute aggregated rating for each DA
  const aggregated = das.map((da) => {
    const ordinalRatings = da.ratings
      .filter((r) => r.ordinalValue !== null)
      .map((r) => ({
        value: r.ordinalValue!,
        weight: r.expert.weight,
      }));

    let aggregatedValue: number | null = null;

    if (ordinalRatings.length > 0) {
      // Weighted average
      const totalWeight = ordinalRatings.reduce((sum, r) => sum + r.weight, 0);
      aggregatedValue =
        ordinalRatings.reduce((sum, r) => sum + r.value * r.weight, 0) / totalWeight;
    }

    return {
      daId: da.id,
      daName: da.name,
      componentId: da.componentId,
      ratingsCount: da.ratings.length,
      aggregatedValue: aggregatedValue ? Math.round(aggregatedValue * 100) / 100 : null,
    };
  });

  res.json(aggregated);
});

export default router;
