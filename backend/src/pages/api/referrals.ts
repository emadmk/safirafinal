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

    // Get current user's referral code
    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: { referralCode: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find users who were referred by this user (have this user's referralCode as their referredBy)
    const referrals = await prisma.user.findMany({
      where: {
        referredBy: user.referralCode,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        investments: {
          where: { paymentStatus: 'FINISHED' },
          select: { id: true, userInvestment: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10, // Limit to last 10 referrals
    });

    // Calculate referral earnings
    const referralsWithEarnings = referrals.map((referral: any) => ({
      id: referral.id,
      firstName: referral.firstName,
      lastName: referral.lastName,
      joinedAt: referral.createdAt,
      hasInvested: referral.investments.length > 0,
      totalInvestments: referral.investments.length,
      potentialEarnings: referral.investments.length * 250,
    }));

    res.json({
      referrals: referralsWithEarnings,
      totalReferrals: referrals.length,
      totalEarnings: referralsWithEarnings.reduce((sum: number, r: any) => sum + r.potentialEarnings, 0),
    });
  } catch (error) {
    console.error('Get referrals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
