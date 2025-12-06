import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';
import crypto from 'crypto';

// Verify API key for external requests
export const verifyApiKey = (req: NextApiRequest): boolean => {
  const apiKey = req.headers['x-safira-api-key'] as string;
  const expectedKey = process.env.EXTERNAL_API_KEY;

  if (!apiKey || !expectedKey) return false;
  return apiKey === expectedKey;
};

// Verify HMAC signature for webhook requests
export const verifySignature = (req: NextApiRequest, body: any): boolean => {
  const signature = req.headers['x-safira-signature'] as string;
  const timestamp = req.headers['x-safira-timestamp'] as string;
  const secret = process.env.EXTERNAL_WEBHOOK_SECRET;

  if (!signature || !timestamp || !secret) return false;

  // Check timestamp is within 5 minutes
  const now = Math.floor(Date.now() / 1000);
  const reqTime = parseInt(timestamp);
  if (Math.abs(now - reqTime) > 300) return false;

  // Verify signature
  const payload = timestamp + '.' + JSON.stringify(body);
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return signature === expectedSignature;
};

// Middleware for external API endpoints
export const requireExternalAuth = (handler: NextApiHandler): NextApiHandler => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (!verifyApiKey(req)) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - Invalid API key'
      });
    }
    return handler(req, res);
  };
};

// Generate signature for outgoing webhooks
export const generateWebhookSignature = (body: any, secret: string): { signature: string; timestamp: string } => {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const payload = timestamp + '.' + JSON.stringify(body);
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return { signature, timestamp };
};
