import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { requireExternalAuth } from '@/lib/externalAuth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Get all unique referral codes from tracking events (these are the sellers/influencers)
    const sellerStats = await prisma.trackingEvent.groupBy({
      by: ['utmSource'],
      where: {
        utmSource: { not: null },
      },
      _count: true,
    });

    // Get conversion data for each seller
    const sellers = await Promise.all(
      sellerStats.map(async (stat: any) => {
        const referralCode = stat.utmSource;

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

        // Calculate commission (20 slots x $40 = $800 max)
        const conversions = investments + purchases;
        const slotsUsed = Math.min(conversions, 20);
        const commissionEarned = slotsUsed * 40;

        return {
          referral_code: referralCode,
          status: conversions > 0 ? 'active' : 'pending',
          stats: {
            total_visits: pageViews,
            unique_visitors: uniqueVisitors.length,
            signups,
            investments,
            purchases,
            conversions,
          },
          commission: {
            slots_used: slotsUsed,
            slots_total: 20,
            earned: commissionEarned,
            pending: conversions > 20 ? (conversions - 20) * 40 : 0,
          },
        };
      })
    );

    res.json({
      success: true,
      data: {
        sellers,
        total: sellers.length,
        last_updated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('External API sellers error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export default requireExternalAuth(handler);
