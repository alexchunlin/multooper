import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../services/prisma.js';
import { NotFoundError, BadRequestError } from '../middleware/errorHandler.js';

const router = Router({ mergeParams: true }); // Access :systemId from parent

// Type for route params
interface SystemParams { systemId: string; }
interface NodeParams { systemId: string; nodeId: string; }

// Validation schemas
const nodeTypeSchema = z.enum(['system', 'subsystem', 'module', 'component', 'group']);

const createNodeSchema = z.object({
  name: z.string().min(1).max(100),
  type: nodeTypeSchema,
  parentId: z.string().uuid().optional().nullable(),
  groupId: z.string().uuid().optional().nullable(),
  description: z.string().max(500).optional(),
  tags: z.array(z.string()).default([]),
  x: z.number().optional(),
  y: z.number().optional(),
});

const updateNodeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
  groupId: z.string().uuid().optional().nullable(),
  tags: z.array(z.string()).optional(),
  x: z.number().optional(),
  y: z.number().optional(),
});

const bulkHierarchySchema = z.array(
  z.object({
    id: z.string().uuid().optional(), // For updates
    name: z.string().min(1).max(100),
    type: nodeTypeSchema,
    parentId: z.string().uuid().optional().nullable(),
    description: z.string().max(500).optional(),
  })
);

// Helper to verify system exists
async function verifySystemExists(systemId: string) {
  const system = await prisma.system.findUnique({ where: { id: systemId } });
  if (!system) {
    throw new NotFoundError('System');
  }
  return system;
}

// GET /api/systems/:systemId/hierarchy - Get full hierarchy
router.get('/', async (req: Request<SystemParams>, res: Response) => {
  const { systemId } = req.params;
  await verifySystemExists(systemId);

  const nodes = await prisma.systemNode.findMany({
    where: { systemId },
    orderBy: [{ type: 'asc' }, { name: 'asc' }],
    include: {
      _count: {
        select: {
          designAlternatives: true,
          children: true,
        },
      },
    },
  });

  res.json(nodes);
});

// PUT /api/systems/:systemId/hierarchy - Replace entire hierarchy
router.put('/', async (req: Request<SystemParams>, res: Response) => {
  const { systemId } = req.params;
  await verifySystemExists(systemId);

  const nodes = bulkHierarchySchema.parse(req.body);

  // Transaction: delete all existing nodes and create new ones
  const result = await prisma.$transaction(async (tx) => {
    // Delete all existing nodes for this system
    await tx.systemNode.deleteMany({ where: { systemId } });

    // Create new nodes
    // First pass: create all nodes without parent relationships
    const createdNodes = [];
    const idMapping = new Map<string, string>(); // old temp id -> new db id

    for (const node of nodes) {
      const tempId = node.id || crypto.randomUUID();
      const created = await tx.systemNode.create({
        data: {
          systemId,
          name: node.name,
          type: node.type,
          description: node.description,
          parentId: null, // Set in second pass
        },
      });
      idMapping.set(tempId, created.id);
      createdNodes.push({ ...node, dbId: created.id, tempId });
    }

    // Second pass: update parent relationships
    for (const node of createdNodes) {
      if (node.parentId) {
        const parentDbId = idMapping.get(node.parentId);
        if (parentDbId) {
          await tx.systemNode.update({
            where: { id: node.dbId },
            data: { parentId: parentDbId },
          });
        }
      }
    }

    // Update system version
    await tx.system.update({
      where: { id: systemId },
      data: { version: { increment: 1 } },
    });

    // Return final nodes
    return tx.systemNode.findMany({
      where: { systemId },
      include: {
        _count: {
          select: {
            designAlternatives: true,
            children: true,
          },
        },
      },
    });
  });

  res.json(result);
});

// POST /api/systems/:systemId/hierarchy/nodes - Create single node
router.post('/nodes', async (req: Request<SystemParams>, res: Response) => {
  const { systemId } = req.params;
  await verifySystemExists(systemId);

  const data = createNodeSchema.parse(req.body);

  // Validate parent exists if provided
  if (data.parentId) {
    const parent = await prisma.systemNode.findFirst({
      where: { id: data.parentId, systemId },
    });
    if (!parent) {
      throw new BadRequestError('Parent node not found in this system');
    }
  }

  // Validate group exists if provided
  if (data.groupId) {
    const group = await prisma.systemNode.findFirst({
      where: { id: data.groupId, systemId, type: 'group' },
    });
    if (!group) {
      throw new BadRequestError('Group node not found in this system');
    }
  }

  const node = await prisma.systemNode.create({
    data: {
      systemId,
      ...data,
    },
    include: {
      _count: {
        select: {
          designAlternatives: true,
          children: true,
        },
      },
    },
  });

  res.status(201).json(node);
});

// GET /api/systems/:systemId/hierarchy/nodes/:nodeId - Get single node
router.get('/nodes/:nodeId', async (req: Request<NodeParams>, res: Response) => {
  const { systemId, nodeId } = req.params;

  const node = await prisma.systemNode.findFirst({
    where: { id: nodeId, systemId },
    include: {
      children: true,
      members: true,
      designAlternatives: true,
      _count: {
        select: {
          designAlternatives: true,
          children: true,
        },
      },
    },
  });

  if (!node) {
    throw new NotFoundError('Node');
  }

  res.json(node);
});

// PUT /api/systems/:systemId/hierarchy/nodes/:nodeId - Update node
router.put('/nodes/:nodeId', async (req: Request<NodeParams>, res: Response) => {
  const { systemId, nodeId } = req.params;
  const data = updateNodeSchema.parse(req.body);

  // Check node exists
  const existing = await prisma.systemNode.findFirst({
    where: { id: nodeId, systemId },
  });
  if (!existing) {
    throw new NotFoundError('Node');
  }

  // Validate new parent if changing
  if (data.parentId !== undefined && data.parentId !== null) {
    // Prevent circular reference
    if (data.parentId === nodeId) {
      throw new BadRequestError('Node cannot be its own parent');
    }

    const parent = await prisma.systemNode.findFirst({
      where: { id: data.parentId, systemId },
    });
    if (!parent) {
      throw new BadRequestError('Parent node not found in this system');
    }
  }

  // Validate new group if changing
  if (data.groupId !== undefined && data.groupId !== null) {
    const group = await prisma.systemNode.findFirst({
      where: { id: data.groupId, systemId, type: 'group' },
    });
    if (!group) {
      throw new BadRequestError('Group node not found in this system');
    }
  }

  const node = await prisma.systemNode.update({
    where: { id: nodeId },
    data: {
      ...data,
      version: { increment: 1 },
    },
    include: {
      _count: {
        select: {
          designAlternatives: true,
          children: true,
        },
      },
    },
  });

  res.json(node);
});

// DELETE /api/systems/:systemId/hierarchy/nodes/:nodeId - Delete node
router.delete('/nodes/:nodeId', async (req: Request<NodeParams>, res: Response) => {
  const { systemId, nodeId } = req.params;

  const existing = await prisma.systemNode.findFirst({
    where: { id: nodeId, systemId },
    include: { _count: { select: { children: true } } },
  });

  if (!existing) {
    throw new NotFoundError('Node');
  }

  // Optionally: prevent deletion if has children
  // if (existing._count.children > 0) {
  //   throw new BadRequestError('Cannot delete node with children');
  // }

  // Delete node (cascades to children and DAs due to schema)
  await prisma.systemNode.delete({ where: { id: nodeId } });

  res.status(204).send();
});

// GET /api/systems/:systemId/hierarchy/components - Get only component nodes
router.get('/components', async (req: Request<SystemParams>, res: Response) => {
  const { systemId } = req.params;
  await verifySystemExists(systemId);

  const components = await prisma.systemNode.findMany({
    where: { systemId, type: 'component' },
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: {
          designAlternatives: true,
        },
      },
    },
  });

  res.json(components);
});

export default router;
