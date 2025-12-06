import { NextApiRequest } from 'next';
import UAParser from 'ua-parser-js';
import prisma from './prisma';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

type EventType =
  | 'PAGE_VIEW'
  | 'SCROLL'
  | 'CLICK'
  | 'SIGNUP'
  | 'INVESTMENT'
  | 'PURCHASE'
  | 'REFERRAL_CLICK'
  | 'SESSION_START'
  | 'SESSION_END'
  | 'LOGIN_CLICK'
  | 'PAYMENT_CLICK'
  | 'REGISTER_CLICK';

// Parse user agent for device info
export const parseUserAgent = (userAgent: string) => {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  return {
    browser: result.browser.name || 'Unknown',
    browserVersion: result.browser.version || 'Unknown',
    os: result.os.name || 'Unknown',
    osVersion: result.os.version || 'Unknown',
    deviceType: result.device.type || 'desktop',
  };
};

// Get client IP from request
export const getClientIP = (req: NextApiRequest): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
};

// Parse UTM parameters from query or body
export const parseUTMParams = (query: any, body?: any) => {
  const source = query || {};
  const bodySource = body || {};

  return {
    utmSource: source.utm_source || source.ref || bodySource.utm_source || bodySource.ref || null,
    utmMedium: source.utm_medium || bodySource.utm_medium || null,
    utmCampaign: source.utm_campaign || bodySource.utm_campaign || null,
    utmContent: source.utm_content || bodySource.utm_content || null,
    utmTerm: source.utm_term || bodySource.utm_term || null,
    referralCode: source.ref || source.referral || bodySource.ref || bodySource.referral || null,
  };
};

// Generate visitor ID (fingerprint-like)
export const generateVisitorId = (req: NextApiRequest): string => {
  const userAgent = req.headers['user-agent'] || '';
  const ip = getClientIP(req);
  const acceptLanguage = req.headers['accept-language'] || '';

  // Create a simple hash
  const data = `${userAgent}-${ip}-${acceptLanguage}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `v_${Math.abs(hash).toString(36)}`;
};

// Track an event
export interface TrackEventParams {
  req: NextApiRequest;
  eventType: EventType;
  eventData?: any;
  pageUrl?: string;
  pageTitle?: string;
  userId?: string;
  sessionId?: string;
  sessionDuration?: number;
  scrollDepth?: number;
}

export const trackEvent = async (params: TrackEventParams) => {
  const {
    req,
    eventType,
    eventData,
    pageUrl,
    pageTitle,
    userId,
    sessionId,
    sessionDuration,
    scrollDepth,
  } = params;

  const userAgent = req.headers['user-agent'] || '';
  const deviceInfo = parseUserAgent(userAgent);
  const utmParams = parseUTMParams(req.query, req.body);
  const visitorId = generateVisitorId(req);
  const ipAddress = getClientIP(req);

  const event = await prisma.trackingEvent.create({
    data: {
      visitorId,
      userId,
      sessionId: sessionId || uuidv4(),
      eventType,
      eventData,
      pageUrl,
      pageTitle,
      ipAddress,
      userAgent,
      deviceType: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      browserVersion: deviceInfo.browserVersion,
      os: deviceInfo.os,
      osVersion: deviceInfo.osVersion,
      sessionDuration,
      scrollDepth,
      ...utmParams,
    },
  });

  // If this is from a microinfluencer (has utm_source), send to their platform
  if (utmParams.utmSource) {
    await sendToMicroinfluencerPlatform(event);
  }

  return event;
};

// Send tracking data to microinfluencer platform
export const sendToMicroinfluencerPlatform = async (event: any) => {
  const apiUrl = process.env.MICROINFLUENCER_API_URL;
  const apiKey = process.env.MICROINFLUENCER_API_KEY;

  if (!apiUrl || !apiKey) {
    console.log('[MicroInfluencer] Missing API URL or Key, skipping webhook');
    return;
  }

  // Use utmSource as referral_code (they should be the same: INF_XXXX)
  const referralCode = event.utmSource || event.referralCode;

  if (!referralCode) {
    console.log('[MicroInfluencer] No referral code found, skipping webhook');
    return;
  }

  const payload = {
    event_type: event.eventType,
    event_id: event.id, // Required by MicroInfluencer API
    referral_code: referralCode,
    timestamp: event.createdAt?.toISOString() || new Date().toISOString(),
    utm_source: event.utmSource,
    utm_medium: event.utmMedium,
    utm_campaign: event.utmCampaign,
    utm_content: event.utmContent,
    visitor_id: event.visitorId,
    user_id: event.userId,
    session_id: event.sessionId,
    device_type: event.deviceType,
    browser: event.browser,
    browser_version: event.browserVersion,
    os: event.os,
    os_version: event.osVersion,
    page_url: event.pageUrl,
    page_title: event.pageTitle,
    session_duration: event.sessionDuration,
    scroll_depth: event.scrollDepth,
  };

  console.log('[MicroInfluencer] Sending tracking event:', {
    url: `${apiUrl}/webhooks/safira-tracking`,
    referral_code: referralCode,
    event_type: event.eventType,
  });

  try {
    const response = await axios.post(
      `${apiUrl}/webhooks/safira-tracking`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      }
    );
    console.log('[MicroInfluencer] Webhook response:', response.data);
  } catch (error: any) {
    console.error('[MicroInfluencer] Failed to send tracking:', error.response?.data || error.message);
  }
};

// Get analytics for a specific referral code (for microinfluencer API)
export const getAnalyticsByReferralCode = async (referralCode: string, startDate?: Date, endDate?: Date) => {
  const where: any = { referralCode };

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  const events: any[] = await prisma.trackingEvent.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  // Aggregate data
  const pageViews = events.filter((e: any) => e.eventType === 'PAGE_VIEW').length;
  const signups = events.filter((e: any) => e.eventType === 'SIGNUP').length;
  const investments = events.filter((e: any) => e.eventType === 'INVESTMENT').length;
  const purchases = events.filter((e: any) => e.eventType === 'PURCHASE').length;

  const uniqueVisitors = new Set(events.map((e: any) => e.visitorId)).size;
  const uniqueSessions = new Set(events.map((e: any) => e.sessionId)).size;

  // Device breakdown
  const deviceBreakdown = events.reduce((acc: any, e: any) => {
    acc[e.deviceType || 'unknown'] = (acc[e.deviceType || 'unknown'] || 0) + 1;
    return acc;
  }, {});

  // Browser breakdown
  const browserBreakdown = events.reduce((acc: any, e: any) => {
    acc[e.browser || 'unknown'] = (acc[e.browser || 'unknown'] || 0) + 1;
    return acc;
  }, {});

  // Hourly breakdown
  const hourlyBreakdown = events.reduce((acc: any, e) => {
    const hour = new Date(e.createdAt).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {});

  return {
    summary: {
      totalEvents: events.length,
      pageViews,
      signups,
      investments,
      purchases,
      uniqueVisitors,
      uniqueSessions,
      conversionRate: uniqueVisitors > 0 ? ((signups + investments) / uniqueVisitors * 100).toFixed(2) : '0',
    },
    breakdown: {
      device: deviceBreakdown,
      browser: browserBreakdown,
      hourly: hourlyBreakdown,
    },
    recentEvents: events.slice(0, 100).map(e => ({
      id: e.id,
      type: e.eventType,
      timestamp: e.createdAt,
      device: e.deviceType,
      browser: e.browser,
      page: e.pageUrl,
      sessionDuration: e.sessionDuration,
      scrollDepth: e.scrollDepth,
    })),
  };
};

// Send conversion data to microinfluencer platform
export const sendConversionToMicroinfluencer = async (params: {
  conversionType: 'INVESTMENT' | 'PURCHASE';
  conversionId: string;
  referralCode: string;
  customerId: string;
  customerEmail?: string;
  amount: number;
  commission: number;
}) => {
  const apiUrl = process.env.MICROINFLUENCER_API_URL;
  const apiKey = process.env.MICROINFLUENCER_API_KEY;

  if (!apiUrl || !apiKey || !params.referralCode) return;

  try {
    await axios.post(
      `${apiUrl}/webhooks/safira-conversion`,
      {
        conversion_type: params.conversionType,
        conversion_id: params.conversionId,
        referral_code: params.referralCode,
        timestamp: new Date().toISOString(),
        customer: {
          id: params.customerId,
          email_hash: params.customerEmail ?
            require('crypto').createHash('sha256').update(params.customerEmail).digest('hex') : null,
          is_new: true,
        },
        transaction: {
          amount: params.amount,
          currency: 'USD',
          commission: params.commission,
          commission_rate: 25,
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      }
    );
  } catch (error) {
    console.error('Failed to send conversion to microinfluencer platform:', error);
  }
};

// Send daily stats to microinfluencer platform (called by cron job)
export const sendDailyStatsToMicroinfluencer = async () => {
  const apiUrl = process.env.MICROINFLUENCER_API_URL;
  const apiKey = process.env.MICROINFLUENCER_API_KEY;

  if (!apiUrl || !apiKey) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    // Get all unique sources from yesterday
    const sources = await prisma.trackingEvent.groupBy({
      by: ['utmSource'],
      where: {
        createdAt: { gte: yesterday, lt: today },
        utmSource: { not: null },
      },
    });

    const sellers = await Promise.all(
      sources.map(async (s: any) => {
        const where = {
          utmSource: s.utmSource,
          createdAt: { gte: yesterday, lt: today },
        };

        const [visits, signups, investments, purchases] = await Promise.all([
          prisma.trackingEvent.count({ where: { ...where, eventType: 'PAGE_VIEW' } }),
          prisma.trackingEvent.count({ where: { ...where, eventType: 'SIGNUP' } }),
          prisma.trackingEvent.count({ where: { ...where, eventType: 'INVESTMENT' } }),
          prisma.trackingEvent.count({ where: { ...where, eventType: 'PURCHASE' } }),
        ]);

        const uniqueVisitors = await prisma.trackingEvent.findMany({
          where,
          distinct: ['visitorId'],
          select: { visitorId: true },
        });

        return {
          referral_code: s.utmSource,
          visits,
          unique_visitors: uniqueVisitors.length,
          signups,
          investments,
          purchases,
          revenue: (investments + purchases) * 100,
          commission_earned: (investments + purchases) * 40,
        };
      })
    );

    await axios.post(
      `${apiUrl}/webhooks/safira-daily-stats`,
      {
        date: yesterday.toISOString().split('T')[0],
        sellers,
        totals: {
          total_visits: sellers.reduce((sum, s) => sum + s.visits, 0),
          total_unique_visitors: sellers.reduce((sum, s) => sum + s.unique_visitors, 0),
          total_signups: sellers.reduce((sum, s) => sum + s.signups, 0),
          total_conversions: sellers.reduce((sum, s) => sum + s.investments + s.purchases, 0),
          total_revenue: sellers.reduce((sum, s) => sum + s.revenue, 0),
          total_commission: sellers.reduce((sum, s) => sum + s.commission_earned, 0),
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );
  } catch (error) {
    console.error('Failed to send daily stats to microinfluencer platform:', error);
  }
};

export default {
  trackEvent,
  parseUserAgent,
  getClientIP,
  parseUTMParams,
  generateVisitorId,
  getAnalyticsByReferralCode,
  sendToMicroinfluencerPlatform,
  sendConversionToMicroinfluencer,
  sendDailyStatsToMicroinfluencer,
};
