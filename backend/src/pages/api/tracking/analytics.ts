import type { NextApiRequest, NextApiResponse } from 'next';
import { getAnalyticsByReferralCode } from '@/lib/tracking';

// This endpoint is for the microinfluencer platform to fetch analytics
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify API key from microinfluencer platform
    const apiKey = req.headers['x-api-key'] || req.query.api_key;
    const expectedApiKey = process.env.MICROINFLUENCER_API_KEY;

    if (!apiKey || apiKey !== expectedApiKey) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    const { referral_code, start_date, end_date } = req.query;

    if (!referral_code) {
      return res.status(400).json({ error: 'referral_code is required' });
    }

    const startDate = start_date ? new Date(start_date as string) : undefined;
    const endDate = end_date ? new Date(end_date as string) : undefined;

    const analytics = await getAnalyticsByReferralCode(
      referral_code as string,
      startDate,
      endDate
    );

    res.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
