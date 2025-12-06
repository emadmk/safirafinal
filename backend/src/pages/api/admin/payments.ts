import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { page = '1', limit = '50', status, type } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) {
      where.paymentStatus = status;
    }
    if (type) {
      where.payType = type;
    }

    const [logs, total] = await Promise.all([
      prisma.paymentLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.paymentLog.count({ where }),
    ]);

    // Get payment stats
    const [
      totalPending,
      totalConfirming,
      totalFinished,
      totalFailed,
      totalExpired,
    ] = await Promise.all([
      prisma.paymentLog.count({ where: { paymentStatus: 'waiting' } }),
      prisma.paymentLog.count({ where: { paymentStatus: 'confirming' } }),
      prisma.paymentLog.count({ where: { paymentStatus: 'finished' } }),
      prisma.paymentLog.count({ where: { paymentStatus: 'failed' } }),
      prisma.paymentLog.count({ where: { paymentStatus: 'expired' } }),
    ]);

    res.json({
      logs,
      stats: {
        pending: totalPending,
        confirming: totalConfirming,
        finished: totalFinished,
        failed: totalFailed,
        expired: totalExpired,
      },
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAdmin(handler);
