import type { NextApiRequest, NextApiResponse } from 'next';
import { trackEvent } from '@/lib/tracking';
import { EventType } from '@prisma/client';
import { z } from 'zod';

const eventSchema = z.object({
  eventType: z.enum(['PAGE_VIEW', 'SCROLL', 'CLICK', 'SESSION_START', 'SESSION_END', 'REFERRAL_CLICK']),
  pageUrl: z.string().optional(),
  pageTitle: z.string().optional(),
  eventData: z.any().optional(),
  sessionId: z.string().optional(),
  sessionDuration: z.number().optional(),
  scrollDepth: z.number().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = eventSchema.parse(req.body);

    const event = await trackEvent({
      req,
      eventType: data.eventType as EventType,
      pageUrl: data.pageUrl,
      pageTitle: data.pageTitle,
      eventData: data.eventData,
      sessionId: data.sessionId,
      sessionDuration: data.sessionDuration,
      scrollDepth: data.scrollDepth,
    });

    res.json({ success: true, eventId: event.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Track event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
