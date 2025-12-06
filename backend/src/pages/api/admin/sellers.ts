import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all unique UTM sources (these are the sellers/influencers)
    const sources = await prisma.trackingEvent.groupBy({
      by: ['utmSource'],
      where: {
        utmSource: { not: null },
      },
      _count: true,
      orderBy: { _count: { utmSource: 'desc' } },
    });

    // Get detailed stats for each seller
    const sellers = await Promise.all(
      sources.map(async (source: any) => {
        const referralCode = source.utmSource;

        // Count different event types
        const [pageViews, signups, investments, purchases] = await Promise.all([
          prisma.trackingEvent.count({
            where: { utmSource: referralCode, eventType: 'PAGE_VIEW' },
          }),
          prisma.trackingEvent.count({
            where: { utmSource: referralCode, eventType: 'SIGNUP' },
          }),
          prisma.trackingEvent.count({
            where: { utmSource: referralCode, eventType: 'INVESTMENT' },
          }),
          prisma.trackingEvent.count({
            where: { utmSource: referralCode, eventType: 'PURCHASE' },
          }),
        ]);

        // Get unique visitors
        const uniqueVisitors = await prisma.trackingEvent.findMany({
          where: { utmSource: referralCode },
          distinct: ['visitorId'],
          select: { visitorId: true },
        });

        // Get first and last activity
        const [firstEvent, lastEvent] = await Promise.all([
          prisma.trackingEvent.findFirst({
            where: { utmSource: referralCode },
            orderBy: { createdAt: 'asc' },
            select: { createdAt: true },
          }),
          prisma.trackingEvent.findFirst({
            where: { utmSource: referralCode },
            orderBy: { createdAt: 'desc' },
            select: { createdAt: true },
          }),
        ]);

        // Calculate commission (20 slots x $40 = $800 max per cycle)
        const conversions = investments + purchases;
        const slotsUsed = Math.min(conversions, 20);
        const commissionEarned = slotsUsed * 40;
        const pendingCommission = conversions > 20 ? (conversions - 20) * 40 : 0;

        return {
          referralCode,
          totalEvents: source._count,
          pageViews,
          uniqueVisitors: uniqueVisitors.length,
          signups,
          investments,
          purchases,
          conversions,
          conversionRate: uniqueVisitors.length > 0
            ? ((conversions / uniqueVisitors.length) * 100).toFixed(2)
            : '0',
          slotsUsed,
          slotsTotal: 20,
          commissionEarned,
          pendingCommission,
          status: slotsUsed >= 20 ? 'ready_payout' : conversions > 0 ? 'active' : 'pending',
          firstActivity: firstEvent?.createdAt,
          lastActivity: lastEvent?.createdAt,
        };
      })
    );

    // Calculate totals
    const totals = {
      totalSellers: sellers.length,
      totalPageViews: sellers.reduce((sum, s) => sum + s.pageViews, 0),
      totalUniqueVisitors: sellers.reduce((sum, s) => sum + s.uniqueVisitors, 0),
      totalConversions: sellers.reduce((sum, s) => sum + s.conversions, 0),
      totalCommissionEarned: sellers.reduce((sum, s) => sum + s.commissionEarned, 0),
      totalPendingCommission: sellers.reduce((sum, s) => sum + s.pendingCommission, 0),
      sellersReadyForPayout: sellers.filter(s => s.status === 'ready_payout').length,
    };

    res.json({ sellers, totals });
  } catch (error) {
    console.error('Get sellers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAdmin(handler);
