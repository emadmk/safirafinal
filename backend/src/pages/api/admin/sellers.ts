import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code } = req.query;

    // If specific code requested, return detailed data
    if (code) {
      return getSellerDetails(req, res, code as string);
    }

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

        // Count different event types from tracking
        const [pageViews, signups, investmentClicks] = await Promise.all([
          prisma.trackingEvent.count({
            where: { utmSource: referralCode, eventType: 'PAGE_VIEW' },
          }),
          prisma.trackingEvent.count({
            where: { utmSource: referralCode, eventType: 'SIGNUP' },
          }),
          prisma.trackingEvent.count({
            where: { utmSource: referralCode, eventType: 'INVESTMENT' },
          }),
        ]);

        // Get unique visitors
        const uniqueVisitors = await prisma.trackingEvent.findMany({
          where: { utmSource: referralCode },
          distinct: ['visitorId'],
          select: { visitorId: true },
        });

        // Get users who came from this referral
        const referredUsers = await prisma.user.findMany({
          where: { referredBy: referralCode },
          select: { id: true },
        });
        const userIds = referredUsers.map((u: { id: string }) => u.id);

        // Count ONLY FINISHED payments for commission
        const [finishedInvestments, pendingInvestments] = await Promise.all([
          prisma.investment.count({
            where: {
              userId: { in: userIds },
              paymentStatus: 'FINISHED',
            },
          }),
          prisma.investment.count({
            where: {
              userId: { in: userIds },
              paymentStatus: { in: ['PENDING', 'CONFIRMING', 'CONFIRMED', 'SENDING'] },
            },
          }),
        ]);

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

        // Commission only for FINISHED payments
        const conversions = finishedInvestments;
        const slotsUsed = Math.min(conversions, 20);
        const commissionEarned = slotsUsed * 40;
        const pendingCommission = conversions > 20 ? (conversions - 20) * 40 : 0;

        return {
          referralCode,
          totalEvents: source._count,
          pageViews,
          uniqueVisitors: uniqueVisitors.length,
          signups,
          investmentClicks,
          referredUsers: userIds.length,
          finishedInvestments,
          pendingInvestments,
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

// Get detailed info for a specific seller
async function getSellerDetails(req: NextApiRequest, res: NextApiResponse, referralCode: string) {
  try {
    // Get all tracking events for this referral
    const trackingStats = await prisma.trackingEvent.groupBy({
      by: ['eventType'],
      where: { utmSource: referralCode },
      _count: true,
    });

    // Get UTM medium breakdown
    const mediumStats = await prisma.trackingEvent.groupBy({
      by: ['utmMedium'],
      where: { utmSource: referralCode },
      _count: true,
    });

    // Get all users who came from this referral with full details
    const users = await prisma.user.findMany({
      where: { referredBy: referralCode },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        city: true,
        country: true,
        createdAt: true,
        investments: {
          select: {
            id: true,
            userInvestment: true,
            paymentStatus: true,
            productionStatus: true,
            createdAt: true,
            investmentDate: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get tracking events for each user
    const usersWithTracking = await Promise.all(
      users.map(async (user: any) => {
        const userTracking = await prisma.trackingEvent.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            createdAt: true,
            deviceType: true,
            browser: true,
            utmMedium: true,
          },
        });

        const firstVisit = await prisma.trackingEvent.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: 'asc' },
          select: { createdAt: true },
        });

        // Calculate user status
        let status = 'registered';
        let totalInvested = 0;
        let finishedCount = 0;
        let pendingCount = 0;

        user.investments.forEach((inv: any) => {
          if (inv.paymentStatus === 'FINISHED') {
            finishedCount++;
            totalInvested += inv.userInvestment;
            status = 'invested';
          } else if (['PENDING', 'CONFIRMING', 'CONFIRMED', 'SENDING'].includes(inv.paymentStatus)) {
            pendingCount++;
            status = 'pending_payment';
          }
        });

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          phone: user.phone,
          location: [user.city, user.country].filter(Boolean).join(', '),
          registeredAt: user.createdAt,
          firstVisit: firstVisit?.createdAt,
          lastActivity: userTracking[0]?.createdAt,
          device: userTracking[0]?.deviceType,
          browser: userTracking[0]?.browser,
          source: userTracking[0]?.utmMedium || 'direct',
          status,
          totalInvestments: user.investments.length,
          finishedInvestments: finishedCount,
          pendingInvestments: pendingCount,
          totalInvested,
          commissionEarned: finishedCount * 40,
          investments: user.investments.map((inv: any) => ({
            id: inv.id,
            amount: inv.userInvestment,
            paymentStatus: inv.paymentStatus,
            productionStatus: inv.productionStatus,
            createdAt: inv.createdAt,
            paidAt: inv.investmentDate,
          })),
        };
      })
    );

    // Summary stats
    const summary = {
      totalUsers: users.length,
      totalFinishedInvestments: usersWithTracking.reduce((sum, u) => sum + u.finishedInvestments, 0),
      totalPendingInvestments: usersWithTracking.reduce((sum, u) => sum + u.pendingInvestments, 0),
      totalRevenue: usersWithTracking.reduce((sum, u) => sum + u.totalInvested, 0),
      totalCommission: usersWithTracking.reduce((sum, u) => sum + u.commissionEarned, 0),
      byStatus: {
        registered: usersWithTracking.filter(u => u.status === 'registered').length,
        pending_payment: usersWithTracking.filter(u => u.status === 'pending_payment').length,
        invested: usersWithTracking.filter(u => u.status === 'invested').length,
      },
      bySource: mediumStats.map((m: any) => ({
        source: m.utmMedium || 'direct',
        count: m._count,
      })),
      byEvent: trackingStats.map((t: any) => ({
        event: t.eventType,
        count: t._count,
      })),
    };

    res.json({
      referralCode,
      summary,
      users: usersWithTracking,
    });
  } catch (error) {
    console.error('Get seller details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAdmin(handler);
