import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { requireExternalAuth } from '@/lib/externalAuth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { code } = req.query;
  const referralCode = code as string;

  if (!referralCode) {
    return res.status(400).json({ success: false, error: 'Referral code is required' });
  }

  try {
    // Check if this referral code exists
    const hasEvents = await prisma.trackingEvent.findFirst({
      where: { utmSource: referralCode },
    });

    if (!hasEvents) {
      return res.status(404).json({ success: false, error: 'Seller not found' });
    }

    // Get date range from query params
    const { start_date, end_date, period = '30d' } = req.query;

    let dateFilter: any = {};
    if (start_date || end_date) {
      dateFilter.createdAt = {};
      if (start_date) dateFilter.createdAt.gte = new Date(start_date as string);
      if (end_date) dateFilter.createdAt.lte = new Date(end_date as string);
    } else {
      // Default to last 30 days
      const days = parseInt(period as string) || 30;
      dateFilter.createdAt = {
        gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
      };
    }

    const where = { utmSource: referralCode, ...dateFilter };

    // Get all stats
    const [
      totalEvents,
      pageViews,
      signups,
      investments,
      purchases,
      uniqueVisitorRecords,
      uniqueSessionRecords,
    ] = await Promise.all([
      prisma.trackingEvent.count({ where }),
      prisma.trackingEvent.count({ where: { ...where, eventType: 'PAGE_VIEW' } }),
      prisma.trackingEvent.count({ where: { ...where, eventType: 'SIGNUP' } }),
      prisma.trackingEvent.count({ where: { ...where, eventType: 'INVESTMENT' } }),
      prisma.trackingEvent.count({ where: { ...where, eventType: 'PURCHASE' } }),
      prisma.trackingEvent.findMany({
        where,
        distinct: ['visitorId'],
        select: { visitorId: true },
      }),
      prisma.trackingEvent.findMany({
        where,
        distinct: ['sessionId'],
        select: { sessionId: true },
      }),
    ]);

    const uniqueVisitors = uniqueVisitorRecords.length;
    const uniqueSessions = uniqueSessionRecords.length;

    // Device breakdown
    const deviceStats = await prisma.trackingEvent.groupBy({
      by: ['deviceType'],
      where,
      _count: true,
    });

    // Browser breakdown
    const browserStats = await prisma.trackingEvent.groupBy({
      by: ['browser'],
      where,
      _count: true,
    });

    // Daily breakdown
    const events = await prisma.trackingEvent.findMany({
      where,
      select: { createdAt: true, eventType: true },
      orderBy: { createdAt: 'asc' },
    });

    const dailyStats: Record<string, any> = {};
    events.forEach((e: any) => {
      const date = e.createdAt.toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { views: 0, signups: 0, conversions: 0 };
      }
      if (e.eventType === 'PAGE_VIEW') dailyStats[date].views++;
      if (e.eventType === 'SIGNUP') dailyStats[date].signups++;
      if (e.eventType === 'INVESTMENT' || e.eventType === 'PURCHASE') {
        dailyStats[date].conversions++;
      }
    });

    // Commission calculation
    const conversions = investments + purchases;
    const slotsUsed = Math.min(conversions, 20);
    const commissionEarned = slotsUsed * 40;

    // Recent events
    const recentEvents = await prisma.trackingEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        eventType: true,
        pageUrl: true,
        deviceType: true,
        browser: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      data: {
        referral_code: referralCode,
        period: {
          start: dateFilter.createdAt?.gte?.toISOString() || null,
          end: dateFilter.createdAt?.lte?.toISOString() || new Date().toISOString(),
        },
        summary: {
          total_events: totalEvents,
          page_views: pageViews,
          unique_visitors: uniqueVisitors,
          unique_sessions: uniqueSessions,
          signups,
          investments,
          purchases,
          conversions,
          conversion_rate: uniqueVisitors > 0 ? ((conversions / uniqueVisitors) * 100).toFixed(2) : '0',
          signup_rate: uniqueVisitors > 0 ? ((signups / uniqueVisitors) * 100).toFixed(2) : '0',
        },
        commission: {
          slots_used: slotsUsed,
          slots_total: 20,
          amount_per_slot: 40,
          earned: commissionEarned,
          max_earnings: 800,
          next_payout_at: slotsUsed >= 20 ? 'Ready for payout' : `${20 - slotsUsed} more conversions needed`,
        },
        breakdown: {
          by_device: deviceStats.map((d: any) => ({
            device: d.deviceType || 'unknown',
            count: d._count,
          })),
          by_browser: browserStats.map((b: any) => ({
            browser: b.browser || 'unknown',
            count: b._count,
          })),
          by_day: Object.entries(dailyStats).map(([date, stats]: any) => ({
            date,
            ...stats,
          })),
        },
        recent_events: recentEvents.map((e: any) => ({
          id: e.id,
          type: e.eventType,
          page: e.pageUrl,
          device: e.deviceType,
          browser: e.browser,
          timestamp: e.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('External API seller detail error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export default requireExternalAuth(handler);
