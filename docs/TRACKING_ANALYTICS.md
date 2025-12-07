# Tracking & Analytics Documentation

## Overview

Safira implements a comprehensive tracking system for:
1. User behavior analytics
2. Influencer/seller attribution
3. Conversion funnel analysis
4. MicroInfluencer platform integration

---

## UTM Parameter Structure

### URL Format
```
https://safiralux.com/invest?utm_source=INF_ABC123&utm_medium=instagram
```

### Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `utm_source` | Influencer/seller code | `INF_ABC123` |
| `utm_medium` | Traffic source platform | `instagram`, `tiktok`, `youtube` |
| `utm_campaign` | Campaign name | `winter_sale` |
| `utm_content` | Content identifier | `bio_link` |
| `utm_term` | Search terms | `persian_art` |
| `ref` | Alternative to utm_source | `INF_ABC123` |

### Referral Links by Platform

```
Instagram:  https://safiralux.com/invest?utm_source=INF_XXX&utm_medium=instagram
TikTok:     https://safiralux.com/invest?utm_source=INF_XXX&utm_medium=tiktok
YouTube:    https://safiralux.com/invest?utm_source=INF_XXX&utm_medium=youtube
Twitter/X:  https://safiralux.com/invest?utm_source=INF_XXX&utm_medium=twitter
Facebook:   https://safiralux.com/invest?utm_source=INF_XXX&utm_medium=facebook
LinkedIn:   https://safiralux.com/invest?utm_source=INF_XXX&utm_medium=linkedin
Blog:       https://safiralux.com/invest?utm_source=INF_XXX&utm_medium=blog
Email:      https://safiralux.com/invest?utm_source=INF_XXX&utm_medium=email
```

---

## Event Types

### Supported Events

| Event | Description | When Triggered |
|-------|-------------|----------------|
| `PAGE_VIEW` | Page loaded | On page load |
| `SCROLL` | User scrolled | Scroll milestones (25%, 50%, 75%, 100%) |
| `CLICK` | Button clicked | CTA button clicks |
| `SIGNUP` | User registered | After successful registration |
| `INVESTMENT` | Investment started | When payment is initiated |
| `PURCHASE` | Shop purchase | When shop payment starts |
| `SESSION_START` | New session | First page view |
| `SESSION_END` | Session ended | Tab close/timeout |
| `LOGIN_CLICK` | Login button | Login button click |
| `PAYMENT_CLICK` | Payment button | Payment button click |
| `REGISTER_CLICK` | Register button | Register button click |
| `REFERRAL_CLICK` | Referral link | Referral link copied/clicked |

---

## Frontend Tracking Implementation

### File: `frontend/src/lib/tracking.ts`

```typescript
// Initialize tracking on page load
export const initTracking = async () => {
  const params = new URLSearchParams(window.location.search);

  await fetch('/api/tracking/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventType: 'PAGE_VIEW',
      pageUrl: window.location.href,
      pageTitle: document.title,
      sessionId: getSessionId(),
      utm_source: params.get('utm_source') || params.get('ref'),
      utm_medium: params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign'),
    }),
  });
};

// Track specific events
export const trackEvent = async (
  eventType: string,
  data?: Record<string, any>
) => {
  await fetch('/api/tracking/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventType,
      sessionId: getSessionId(),
      ...data,
    }),
  });
};
```

### Usage in Pages

```typescript
// In Invest.tsx
useEffect(() => {
  initTracking();  // Track page view
}, []);

// After registration
const handleCreateAccount = async () => {
  // ... registration logic ...
  trackEvent('SIGNUP', { referralCode: referredBy });
};

// On payment click
const handleInvest = () => {
  trackEvent('INVESTMENT', { amount: 100 });
  // ... redirect to payment ...
};
```

---

## Backend Tracking Implementation

### File: `backend/src/lib/tracking.ts`

```typescript
// Parse UTM parameters from request
export const parseUTMParams = (query: any, body?: any) => {
  const source = query || {};
  const bodySource = body || {};

  return {
    utmSource: source.utm_source || source.ref ||
               bodySource.utm_source || bodySource.ref || null,
    utmMedium: source.utm_medium || bodySource.utm_medium || null,
    utmCampaign: source.utm_campaign || bodySource.utm_campaign || null,
    utmContent: source.utm_content || bodySource.utm_content || null,
    utmTerm: source.utm_term || bodySource.utm_term || null,
    referralCode: source.ref || source.referral ||
                  bodySource.ref || bodySource.referral || null,
  };
};

// Track event and send to MicroInfluencer
export const trackEvent = async (params: TrackEventParams) => {
  const event = await prisma.trackingEvent.create({
    data: { /* ... event data ... */ },
  });

  // If has UTM source, send to MicroInfluencer platform
  if (params.utmSource) {
    await sendToMicroinfluencerPlatform(event);
  }

  return event;
};
```

### File: `backend/src/pages/api/tracking/event.ts`

```typescript
const eventSchema = z.object({
  eventType: z.enum([
    'PAGE_VIEW', 'SCROLL', 'CLICK', 'SIGNUP', 'INVESTMENT',
    'PURCHASE', 'REFERRAL_CLICK', 'SESSION_START', 'SESSION_END',
    'LOGIN_CLICK', 'PAYMENT_CLICK', 'REGISTER_CLICK'
  ]),
  pageUrl: z.string().optional(),
  pageTitle: z.string().optional(),
  sessionId: z.string().optional(),
  scrollDepth: z.number().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  ref: z.string().optional(),
});

export default async function handler(req, res) {
  const data = eventSchema.parse(req.body);

  const event = await trackEvent({
    req,
    eventType: data.eventType,
    pageUrl: data.pageUrl,
    // ... other fields
  });

  return res.json({ success: true, eventId: event.id });
}
```

---

## MicroInfluencer Integration

### Outgoing Webhooks

#### 1. Tracking Events Webhook
Sent immediately when an event is tracked with a UTM source.

**Endpoint**: `POST /webhooks/safira-tracking`

**Payload**:
```json
{
  "event_type": "PAGE_VIEW",
  "event_id": "uuid",
  "referral_code": "INF_ABC123",
  "timestamp": "2024-01-15T10:30:00Z",
  "utm_source": "INF_ABC123",
  "utm_medium": "instagram",
  "utm_campaign": null,
  "utm_content": null,
  "visitor_id": "v_abc123",
  "user_id": null,
  "session_id": "sess_xyz",
  "device_type": "mobile",
  "browser": "Chrome",
  "browser_version": "120.0",
  "os": "iOS",
  "os_version": "17.0",
  "page_url": "https://safiralux.com/invest?utm_source=INF_ABC123",
  "page_title": "Invest - Safira",
  "session_duration": null,
  "scroll_depth": null
}
```

#### 2. Conversion Webhook
Sent when a payment is marked as FINISHED.

**Endpoint**: `POST /webhooks/safira-conversion`

**Payload**:
```json
{
  "conversion_type": "INVESTMENT",
  "conversion_id": "inv-uuid",
  "referral_code": "INF_ABC123",
  "timestamp": "2024-01-15T12:00:00Z",
  "customer": {
    "id": "user-uuid",
    "email_hash": "sha256-hash",
    "is_new": true
  },
  "transaction": {
    "amount": 100,
    "currency": "USD",
    "commission": 40,
    "commission_rate": 25
  }
}
```

#### 3. Daily Stats Webhook (Optional)
Sent via cron job with daily summary.

**Endpoint**: `POST /webhooks/safira-daily-stats`

**Payload**:
```json
{
  "date": "2024-01-14",
  "sellers": [
    {
      "referral_code": "INF_ABC123",
      "visits": 150,
      "unique_visitors": 100,
      "signups": 10,
      "investments": 2,
      "purchases": 0,
      "revenue": 200,
      "commission_earned": 80
    }
  ],
  "totals": {
    "total_visits": 500,
    "total_unique_visitors": 350,
    "total_signups": 30,
    "total_conversions": 5,
    "total_revenue": 500,
    "total_commission": 200
  }
}
```

### Webhook Authentication

```
Authorization: Bearer safira-external-key-2024
Content-Type: application/json
```

---

## Commission System

### Calculation Rules

1. **Only FINISHED payments count**
   - Pending/confirming payments = 0 commission
   - Commission calculated when `paymentStatus = 'FINISHED'`

2. **20 Slots per Influencer**
   - Each influencer has 20 commission slots
   - $40 per finished investment
   - Maximum $800 per influencer

3. **Commission Formula**
```typescript
const finishedInvestments = await prisma.investment.count({
  where: {
    user: { referredBy: referralCode },
    paymentStatus: 'FINISHED',
  },
});

const slotsUsed = Math.min(finishedInvestments, 20);
const commissionEarned = slotsUsed * 40;
const pendingCommission = finishedInvestments > 20
  ? (finishedInvestments - 20) * 40
  : 0;
```

### Status Determination

```typescript
let status = 'pending';
if (slotsUsed >= 20) {
  status = 'ready_payout';
} else if (finishedInvestments > 0) {
  status = 'active';
}
```

---

## Analytics Queries

### Get Seller Summary
```typescript
// File: backend/src/pages/api/admin/sellers.ts

// Count tracking events
const pageViews = await prisma.trackingEvent.count({
  where: { utmSource: referralCode, eventType: 'PAGE_VIEW' },
});

// Get unique visitors
const uniqueVisitors = await prisma.trackingEvent.findMany({
  where: { utmSource: referralCode },
  distinct: ['visitorId'],
  select: { visitorId: true },
});

// Get referred users
const referredUsers = await prisma.user.findMany({
  where: { referredBy: referralCode },
});

// Count finished investments
const finishedInvestments = await prisma.investment.count({
  where: {
    userId: { in: userIds },
    paymentStatus: 'FINISHED',
  },
});
```

### Get Funnel Metrics
```typescript
// File: backend/src/pages/api/admin/tracking.ts

const funnel = {
  visits: await prisma.trackingEvent.count({
    where: { eventType: 'PAGE_VIEW' },
  }),
  signups: await prisma.trackingEvent.count({
    where: { eventType: 'SIGNUP' },
  }),
  investments: await prisma.trackingEvent.count({
    where: { eventType: 'INVESTMENT' },
  }),
  purchases: await prisma.trackingEvent.count({
    where: { eventType: 'PURCHASE' },
  }),
};

funnel.signupRate = ((funnel.signups / funnel.visits) * 100).toFixed(2);
funnel.investmentRate = ((funnel.investments / funnel.signups) * 100).toFixed(2);
```

---

## External API for MicroInfluencer

### Base URL
```
https://safiralux.com/api/v1/external
```

### Authentication
```
X-Safira-Api-Key: safira-external-key-2024
```

### Endpoints

#### GET /v1/external/sellers
List all sellers with summary stats.

**Response**:
```json
{
  "success": true,
  "data": {
    "sellers": [
      {
        "referral_code": "INF_ABC123",
        "total_events": 200,
        "page_views": 150,
        "unique_visitors": 100,
        "signups": 10,
        "conversions": 2,
        "commission_earned": 80
      }
    ],
    "totals": {
      "total_sellers": 5,
      "total_page_views": 500,
      "total_conversions": 10,
      "total_commission": 400
    }
  }
}
```

#### GET /v1/external/sellers/:code
Get detailed analytics for a specific seller.

**Response**:
```json
{
  "success": true,
  "data": {
    "referral_code": "INF_ABC123",
    "summary": {
      "total_events": 200,
      "page_views": 150,
      "unique_visitors": 100,
      "signups": 10,
      "conversions": 2,
      "conversion_rate": "2.00"
    },
    "breakdown": {
      "by_medium": [
        { "medium": "instagram", "count": 100 },
        { "medium": "tiktok", "count": 50 }
      ],
      "by_event": [
        { "event": "PAGE_VIEW", "count": 150 },
        { "event": "SIGNUP", "count": 10 }
      ]
    }
  }
}
```

#### GET /v1/external/stats/realtime
Get real-time statistics.

**Response**:
```json
{
  "success": true,
  "data": {
    "timestamp": "2024-01-15T14:30:00Z",
    "realtime": {
      "active_visitors": 5,
      "views_last_hour": 25
    },
    "last_24h": {
      "page_views": 150,
      "signups": 10,
      "investments": 3,
      "purchases": 1,
      "total_conversions": 4
    },
    "investments": {
      "total": 100,
      "pending": 5,
      "finished": 95,
      "total_revenue": 9500
    },
    "top_sellers": [
      { "referral_code": "INF_ABC123", "events": 150 }
    ]
  }
}
```

---

## Debugging Tracking

### Check Event in Database
```sql
SELECT * FROM "TrackingEvent"
WHERE "utmSource" = 'INF_ABC123'
ORDER BY "createdAt" DESC
LIMIT 10;
```

### Check Webhook Logs
```bash
# In backend logs
pm2 logs safira-backend | grep "MicroInfluencer"
```

### Test Tracking Manually
```bash
curl -X POST https://safiralux.com/api/tracking/event \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "PAGE_VIEW",
    "pageUrl": "https://safiralux.com/invest?utm_source=TEST_123",
    "utm_source": "TEST_123",
    "utm_medium": "test"
  }'
```

---

## Environment Variables

```bash
# MicroInfluencer Integration
MICROINFLUENCER_API_URL="https://microinfluencer.com/api"
MICROINFLUENCER_API_KEY="safira-external-key-2024"
```

---

## Attribution Flow

```
User clicks link:
https://safiralux.com/invest?utm_source=INF_ABC123&utm_medium=instagram
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Frontend captures   │
                    │  UTM params from URL │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  initTracking()      │
                    │  sends PAGE_VIEW     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Backend stores      │
                    │  TrackingEvent       │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Webhook sent to     │
                    │  MicroInfluencer     │
                    └──────────────────────┘

User registers:
                    ┌──────────────────────┐
                    │  User.referredBy =   │
                    │  INF_ABC123          │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  SIGNUP event        │
                    │  tracked             │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Webhook sent        │
                    └──────────────────────┘

User pays (FINISHED):
                    ┌──────────────────────┐
                    │  IPN webhook         │
                    │  status = FINISHED   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Commission webhook  │
                    │  sent                │
                    └──────────────────────┘
```

