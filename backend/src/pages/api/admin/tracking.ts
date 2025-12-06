import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { source, start_date, end_date, page = '1', limit = '50' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const where: any = {};
    if (source) {
      where.utmSource = source;
    }
    if (start_date || end_date) {
      where.createdAt = {};
      if (start_date) where.createdAt.gte = new Date(start_date as string);
      if (end_date) where.createdAt.lte = new Date(end_date as string);
    }

    // Get summary by source
    const sourceStats = await prisma.trackingEvent.groupBy({
      by: ['utmSource'],
      where: { utmSource: { not: null } },
      _count: true,
    });

    // Get summary by event type
    const eventStats = await prisma.trackingEvent.groupBy({
      by: ['eventType'],
      _count: true,
    });

    // Get summary by device
    const deviceStats = await prisma.trackingEvent.groupBy({
      by: ['deviceType'],
      _count: true,
    });

    // Get recent events
    const recentEvents = await prisma.trackingEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limitNum,
      skip: (pageNum - 1) * limitNum,
    });

    // Calculate conversion funnel
    const totalVisits = await prisma.trackingEvent.count({
      where: { eventType: 'PAGE_VIEW', ...where },
    });
    const totalSignups = await prisma.trackingEvent.count({
      where: { eventType: 'SIGNUP', ...where },
    });
    const totalInvestments = await prisma.trackingEvent.count({
      where: { eventType: 'INVESTMENT', ...where },
    });
    const totalPurchases = await prisma.trackingEvent.count({
      where: { eventType: 'PURCHASE', ...where },
    });

    res.json({
      summary: {
        bySource: sourceStats.map((s: any) => ({
          source: s.utmSource || 'direct',
          count: s._count,
        })),
        byEvent: eventStats.map((e: any) => ({
          event: e.eventType,
          count: e._count,
        })),
        byDevice: deviceStats.map((d: any) => ({
          device: d.deviceType || 'unknown',
          count: d._count,
        })),
      },
      funnel: {
        visits: totalVisits,
        signups: totalSignups,
        investments: totalInvestments,
        purchases: totalPurchases,
        signupRate: totalVisits > 0 ? ((totalSignups / totalVisits) * 100).toFixed(2) : '0',
        investmentRate: totalSignups > 0 ? ((totalInvestments / totalSignups) * 100).toFixed(2) : '0',
      },
      recentEvents,
    });
  } catch (error) {
    console.error('Get tracking stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAdmin(handler);
