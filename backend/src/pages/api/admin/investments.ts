import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      page = '1',
      limit = '20',
      paymentStatus,
      productionStatus,
      saleStatus,
      search,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }
    if (productionStatus) {
      where.productionStatus = productionStatus;
    }
    if (saleStatus) {
      where.saleStatus = saleStatus;
    }
    if (search) {
      where.OR = [
        { user: { email: { contains: search as string, mode: 'insensitive' } } },
        { user: { firstName: { contains: search as string, mode: 'insensitive' } } },
        { user: { lastName: { contains: search as string, mode: 'insensitive' } } },
        { paymentId: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [investments, total] = await Promise.all([
      prisma.investment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              referralCode: true,
            },
          },
          product: true,
          sales: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.investment.count({ where }),
    ]);

    res.json({
      investments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Admin investments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAdmin(handler);
