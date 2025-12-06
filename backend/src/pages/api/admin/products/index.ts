import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { z } from 'zod';

const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  originalPrice: z.number().positive(),
  images: z.array(z.string()),
  isAvailable: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  material: z.string().optional(),
  dimensions: z.string().optional(),
  weight: z.string().optional(),
  craftsman: z.string().optional(),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { page = '1', limit = '20', available } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};
      if (available !== undefined) {
        where.isAvailable = available === 'true';
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limitNum,
        }),
        prisma.product.count({ where }),
      ]);

      res.json({
        products,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const data = createProductSchema.parse(req.body);

      const product = await prisma.product.create({
        data: {
          name: data.name,
          description: data.description,
          price: data.price,
          originalPrice: data.originalPrice,
          images: data.images,
          isAvailable: data.isAvailable ?? true,
          isFeatured: data.isFeatured ?? false,
          material: data.material,
          dimensions: data.dimensions,
          weight: data.weight,
          craftsman: data.craftsman,
        },
      });

      res.status(201).json({ product });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      console.error('Create product error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default requireAdmin(handler);
