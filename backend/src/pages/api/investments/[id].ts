import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authUser = await authenticateUser(req);
    if (!authUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.query;

    const investment = await prisma.investment.findFirst({
      where: {
        id: id as string,
        userId: authUser.userId,
      },
      include: {
        product: true,
        sales: {
          include: {
            referredByUser: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    });

    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    // Calculate timeline
    const now = new Date();
    let productionDaysElapsed = 0;
    let saleDaysElapsed = 0;
    let productionProgress = 0;
    let saleProgress = 0;

    if (investment.productionStartDate) {
      const prodStart = new Date(investment.productionStartDate);
      const prodEnd = investment.productionEndDate
        ? new Date(investment.productionEndDate)
        : new Date(prodStart.getTime() + 180 * 24 * 60 * 60 * 1000);
      const totalProdDays = Math.ceil((prodEnd.getTime() - prodStart.getTime()) / (1000 * 60 * 60 * 24));
      productionDaysElapsed = Math.max(0, Math.ceil((now.getTime() - prodStart.getTime()) / (1000 * 60 * 60 * 24)));
      productionProgress = Math.min(100, Math.round((productionDaysElapsed / totalProdDays) * 100));
    }

    if (investment.saleStartDate) {
      const saleStart = new Date(investment.saleStartDate);
      const saleEnd = investment.saleEndDate
        ? new Date(investment.saleEndDate)
        : new Date(saleStart.getTime() + 60 * 24 * 60 * 60 * 1000);
      const totalSaleDays = Math.ceil((saleEnd.getTime() - saleStart.getTime()) / (1000 * 60 * 60 * 24));
      saleDaysElapsed = Math.max(0, Math.ceil((now.getTime() - saleStart.getTime()) / (1000 * 60 * 60 * 24)));
      saleProgress = Math.min(100, Math.round((saleDaysElapsed / totalSaleDays) * 100));
    }

    res.json({
      investment: {
        ...investment,
        timeline: {
          productionDaysElapsed,
          productionDaysTotal: 180,
          productionProgress,
          saleDaysElapsed,
          saleDaysTotal: 60,
          saleProgress,
        },
      },
    });
  } catch (error) {
    console.error('Get investment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
