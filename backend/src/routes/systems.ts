import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../services/prisma.js';
import { NotFoundError } from '../middleware/errorHandler.js';

const router = Router();

// Validation schemas
const createSystemSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

const updateSystemSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
});

// GET /api/systems - List all systems
router.get('/', async (_req, res) => {
  const systems = await prisma.system.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: {
        select: {
          nodes: true,
          solutions: true,
        },
      },
    },
  });

  res.json(systems);
});

// GET /api/systems/:id - Get system by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const system = await prisma.system.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          nodes: true,
          solutions: true,
          experts: true,
        },
      },
    },
  });

  if (!system) {
    throw new NotFoundError('System');
  }

  res.json(system);
});

// POST /api/systems - Create new system
router.post('/', async (req, res) => {
  const data = createSystemSchema.parse(req.body);

  const system = await prisma.system.create({
    data,
  });

  res.status(201).json(system);
});

// PUT /api/systems/:id - Update system
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const data = updateSystemSchema.parse(req.body);

  // Check if exists
  const existing = await prisma.system.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError('System');
  }

  const system = await prisma.system.update({
    where: { id },
    data: {
      ...data,
      version: { increment: 1 },
    },
  });

  res.json(system);
});

// DELETE /api/systems/:id - Delete system
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  // Check if exists
  const existing = await prisma.system.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError('System');
  }

  await prisma.system.delete({ where: { id } });

  res.status(204).send();
});

export default router;
