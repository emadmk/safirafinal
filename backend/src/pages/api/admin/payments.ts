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

    // Get pending investments (from Investment table - actual pending payments)
    const pendingInvestments = await prisma.investment.findMany({
      where: { paymentStatus: 'PENDING' },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Payment logs from NowPayment callbacks
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

    // Get payment stats from Investment table (actual payment status)
    const [
      investmentPending,
      investmentConfirming,
      investmentFinished,
      investmentFailed,
      investmentExpired,
    ] = await Promise.all([
      prisma.investment.count({ where: { paymentStatus: 'PENDING' } }),
      prisma.investment.count({ where: { paymentStatus: 'CONFIRMING' } }),
      prisma.investment.count({ where: { paymentStatus: 'FINISHED' } }),
      prisma.investment.count({ where: { paymentStatus: 'FAILED' } }),
      prisma.investment.count({ where: { paymentStatus: 'EXPIRED' } }),
    ]);

    res.json({
      logs,
      pendingInvestments,
      stats: {
        pending: investmentPending,
        confirming: investmentConfirming,
        finished: investmentFinished,
        failed: investmentFailed,
        expired: investmentExpired,
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
