import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get counts
    const [
      totalUsers,
      totalInvestments,
      pendingPayments,
      confirmedPayments,
      finishedPayments,
      inProduction,
      completed,
      activeSales,
      soldProducts,
      totalProducts,
      openTickets,
      pageViews,
      loginClicks,
      paymentClicks,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.investment.count(),
      prisma.investment.count({ where: { paymentStatus: 'PENDING' } }),
      prisma.investment.count({ where: { paymentStatus: 'CONFIRMING' } }),
      prisma.investment.count({ where: { paymentStatus: 'FINISHED' } }),
      prisma.investment.count({ where: { productionStatus: 'IN_PRODUCTION' } }),
      prisma.investment.count({ where: { productionStatus: 'COMPLETED' } }),
      prisma.investment.count({ where: { saleStatus: 'ACTIVE' } }),
      prisma.investment.count({
        where: {
          saleStatus: { in: ['SOLD_BY_INVESTOR', 'SOLD_BY_COMPANY', 'GUARANTEED_DELIVERY'] },
        },
      }),
      prisma.product.count(),
      prisma.ticket.count({ where: { status: 'OPEN' } }),
      prisma.trackingEvent.count({ where: { eventType: 'PAGE_VIEW' } }),
      prisma.trackingEvent.count({ where: { eventType: 'LOGIN_CLICK' } }),
      prisma.trackingEvent.count({ where: { eventType: 'PAYMENT_CLICK' } }),
    ]);

    // Get total revenue
    const sales = await prisma.sale.findMany({
      where: { paymentStatus: 'FINISHED' },
      select: { amount: true },
    });
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.amount, 0);

    // Get investments this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const investmentsThisMonth = await prisma.investment.count({
      where: {
        paymentStatus: 'FINISHED',
        investmentDate: { gte: startOfMonth },
      },
    });

    // Get recent activities
    const recentInvestments = await prisma.investment.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const recentPaymentLogs = await prisma.paymentLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Get tracking stats by source (sellers/affiliates)
    const trackingBySource = await prisma.trackingEvent.groupBy({
      by: ['utmSource'],
      _count: true,
      where: { utmSource: { not: null } },
      orderBy: { _count: { utmSource: 'desc' } },
      take: 10,
    });

    // Get sellers (users with referral traffic)
    const sellersData = await prisma.trackingEvent.groupBy({
      by: ['utmSource'],
      _count: { _all: true },
      where: {
        utmSource: { not: null },
      },
      orderBy: { _count: { _all: 'desc' } },
      take: 10,
    });

    // Get sales count per referral code
    const salesByRef = await prisma.sale.groupBy({
      by: ['referralCode'],
      _count: { _all: true },
      where: {
        referralCode: { not: null },
        paymentStatus: 'FINISHED',
      },
    });

    const salesMap = new Map(salesByRef.map(s => [s.referralCode, s._count._all]));

    const sellers = sellersData.map(s => ({
      referralCode: s.utmSource,
      name: s.utmSource,
      visits: s._count._all,
      sales: salesMap.get(s.utmSource) || 0,
    }));

    const totalSellers = sellersData.length;

    res.json({
      stats: {
        totalUsers,
        totalInvestments,
        payments: {
          pending: pendingPayments,
          confirming: confirmedPayments,
          finished: finishedPayments,
        },
        production: {
          inProduction,
          completed,
        },
        sales: {
          active: activeSales,
          sold: soldProducts,
        },
        totalProducts,
        openTickets,
        totalRevenue,
        investmentsThisMonth,
        pageViews,
        loginClicks,
        paymentClicks,
        totalSellers,
      },
      recentInvestments,
      recentPaymentLogs,
      sellers,
      trackingBySource: trackingBySource.map((t) => ({
        source: t.utmSource,
        count: t._count,
      })),
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAdmin(handler);
