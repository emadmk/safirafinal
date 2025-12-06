import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { requireExternalAuth } from '@/lib/externalAuth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last1h = new Date(now.getTime() - 60 * 60 * 1000);
    const last5min = new Date(now.getTime() - 5 * 60 * 1000);

    // Real-time stats (last 5 minutes)
    const [
      activeNow,
      last1hViews,
      last24hViews,
      last24hSignups,
      last24hInvestments,
      last24hPurchases,
    ] = await Promise.all([
      prisma.trackingEvent.findMany({
        where: { createdAt: { gte: last5min } },
        distinct: ['visitorId'],
        select: { visitorId: true },
      }),
      prisma.trackingEvent.count({
        where: { createdAt: { gte: last1h }, eventType: 'PAGE_VIEW' },
      }),
      prisma.trackingEvent.count({
        where: { createdAt: { gte: last24h }, eventType: 'PAGE_VIEW' },
      }),
      prisma.trackingEvent.count({
        where: { createdAt: { gte: last24h }, eventType: 'SIGNUP' },
      }),
      prisma.trackingEvent.count({
        where: { createdAt: { gte: last24h }, eventType: 'INVESTMENT' },
      }),
      prisma.trackingEvent.count({
        where: { createdAt: { gte: last24h }, eventType: 'PURCHASE' },
      }),
    ]);

    // Top sellers in last 24h
    const topSellers = await prisma.trackingEvent.groupBy({
      by: ['utmSource'],
      where: {
        createdAt: { gte: last24h },
        utmSource: { not: null },
      },
      _count: true,
      orderBy: { _count: { utmSource: 'desc' } },
      take: 10,
    });

    // Investment stats
    const [totalInvestments, pendingInvestments, finishedInvestments] = await Promise.all([
      prisma.investment.count(),
      prisma.investment.count({ where: { paymentStatus: 'PENDING' } }),
      prisma.investment.count({ where: { paymentStatus: 'FINISHED' } }),
    ]);

    // Revenue from finished investments
    const finishedInvestmentData = await prisma.investment.aggregate({
      where: { paymentStatus: 'FINISHED' },
      _sum: { userInvestment: true },
    });

    res.json({
      success: true,
      data: {
        timestamp: now.toISOString(),
        realtime: {
          active_visitors: activeNow.length,
          views_last_hour: last1hViews,
        },
        last_24h: {
          page_views: last24hViews,
          signups: last24hSignups,
          investments: last24hInvestments,
          purchases: last24hPurchases,
          total_conversions: last24hInvestments + last24hPurchases,
        },
        investments: {
          total: totalInvestments,
          pending: pendingInvestments,
          finished: finishedInvestments,
          total_revenue: finishedInvestmentData._sum.userInvestment || 0,
        },
        top_sellers: topSellers.map((s: any) => ({
          referral_code: s.utmSource,
          events: s._count,
        })),
      },
    });
  } catch (error) {
    console.error('External API realtime stats error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export default requireExternalAuth(handler);
