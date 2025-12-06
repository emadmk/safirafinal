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

    const investments = await prisma.investment.findMany({
      where: { userId: authUser.userId },
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
      orderBy: { createdAt: 'desc' },
    });

    // Calculate timeline and status for each investment
    const investmentsWithTimeline = investments.map((inv: any) => {
      const now = new Date();
      let daysInProduction = 0;
      let daysInSale = 0;
      let productionProgress = 0;
      let saleProgress = 0;

      if (inv.productionStartDate) {
        const prodStart = new Date(inv.productionStartDate);
        const prodEnd = inv.productionEndDate ? new Date(inv.productionEndDate) : new Date(prodStart.getTime() + 180 * 24 * 60 * 60 * 1000); // 6 months
        const totalProdDays = Math.ceil((prodEnd.getTime() - prodStart.getTime()) / (1000 * 60 * 60 * 24));
        daysInProduction = Math.max(0, Math.ceil((now.getTime() - prodStart.getTime()) / (1000 * 60 * 60 * 24)));
        productionProgress = Math.min(100, Math.round((daysInProduction / totalProdDays) * 100));
      }

      if (inv.saleStartDate) {
        const saleStart = new Date(inv.saleStartDate);
        const saleEnd = inv.saleEndDate ? new Date(inv.saleEndDate) : new Date(saleStart.getTime() + 60 * 24 * 60 * 60 * 1000); // 2 months
        const totalSaleDays = Math.ceil((saleEnd.getTime() - saleStart.getTime()) / (1000 * 60 * 60 * 24));
        daysInSale = Math.max(0, Math.ceil((now.getTime() - saleStart.getTime()) / (1000 * 60 * 60 * 24)));
        saleProgress = Math.min(100, Math.round((daysInSale / totalSaleDays) * 100));
      }

      return {
        ...inv,
        timeline: {
          productionDaysElapsed: daysInProduction,
          productionDaysTotal: 180,
          productionProgress,
          saleDaysElapsed: daysInSale,
          saleDaysTotal: 60,
          saleProgress,
        },
      };
    });

    res.json({ investments: investmentsWithTimeline });
  } catch (error) {
    console.error('Get investments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
