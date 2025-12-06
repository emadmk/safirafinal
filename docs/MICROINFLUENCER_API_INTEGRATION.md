# Safira <> MicroInfluencer Platform API Integration

## Overview

This document describes the API integration between **Safira Luxury** (safiralux.com) and the **MicroInfluencer Platform** for tracking influencer referrals, sales, and synchronizing seller data.

---

## Architecture

```
┌─────────────────────┐         ┌─────────────────────┐
│   Safira Luxury     │◄───────►│  MicroInfluencer    │
│   (safiralux.com)   │   API   │     Platform        │
├─────────────────────┤         ├─────────────────────┤
│ - E-commerce/Invest │         │ - Influencer mgmt   │
│ - Tracking Events   │         │ - Campaign mgmt     │
│ - Sales/Purchases   │         │ - Analytics         │
│ - Sellers Dashboard │         │ - Payments          │
└─────────────────────┘         └─────────────────────┘
```

---

## 1. APIs that Safira PROVIDES (MicroInfluencer calls these)

### Base URL
```
https://safiralux.com/api/v1/external
```

### Authentication
All requests require API key authentication:
```
Authorization: Bearer {SAFIRA_API_KEY}
X-Platform-ID: microinfluencer
```

---

### 1.1 Get Seller Analytics
Get detailed analytics for a specific influencer/seller.

```http
GET /external/sellers/{referralCode}/analytics
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| start_date | ISO8601 | No | Start of date range |
| end_date | ISO8601 | No | End of date range |
| granularity | string | No | `hourly`, `daily`, `weekly`, `monthly` |

**Response:**
```json
{
  "success": true,
  "data": {
    "referral_code": "INF_ABC123",
    "period": {
      "start": "2025-01-01T00:00:00Z",
      "end": "2025-01-31T23:59:59Z"
    },
    "summary": {
      "total_visits": 1250,
      "unique_visitors": 890,
      "total_signups": 45,
      "total_investments": 12,
      "total_purchases": 8,
      "total_revenue": 6600,
      "total_commission": 1650,
      "conversion_rate": 5.06,
      "avg_order_value": 550
    },
    "breakdown": {
      "by_device": {
        "desktop": 450,
        "mobile": 720,
        "tablet": 80
      },
      "by_browser": {
        "Chrome": 600,
        "Safari": 350,
        "Firefox": 200,
        "Other": 100
      },
      "by_country": {
        "US": 400,
        "UK": 200,
        "DE": 150,
        "Other": 500
      },
      "by_hour": {
        "0": 20, "1": 15, "2": 10, "...": "...",
        "22": 45, "23": 30
      }
    },
    "timeline": [
      {
        "date": "2025-01-01",
        "visits": 45,
        "signups": 2,
        "investments": 1,
        "revenue": 550
      }
    ],
    "recent_events": [
      {
        "id": "evt_123",
        "type": "INVESTMENT",
        "timestamp": "2025-01-15T14:30:00Z",
        "amount": 100,
        "product_value": 600,
        "commission": 50
      }
    ]
  }
}
```

---

### 1.2 Get Seller Profile
Get seller/influencer profile and status on Safira.

```http
GET /external/sellers/{referralCode}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "referral_code": "INF_ABC123",
    "status": "active",
    "joined_at": "2024-06-15T10:00:00Z",
    "total_earnings": 4500,
    "pending_earnings": 750,
    "paid_earnings": 3750,
    "total_referrals": 28,
    "successful_investments": 15,
    "tier": "gold",
    "commission_rate": 25,
    "links": {
      "referral_url": "https://safiralux.com/invest?ref=INF_ABC123",
      "dashboard_url": "https://safiralux.com/seller/INF_ABC123"
    }
  }
}
```

---

### 1.3 List All Sellers
Get list of all registered sellers from MicroInfluencer platform.

```http
GET /external/sellers
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 20, max: 100) |
| status | string | No | Filter: `active`, `inactive`, `pending` |
| sort_by | string | No | `earnings`, `referrals`, `joined_at` |
| order | string | No | `asc`, `desc` |

**Response:**
```json
{
  "success": true,
  "data": {
    "sellers": [
      {
        "referral_code": "INF_ABC123",
        "name": "John Doe",
        "status": "active",
        "total_earnings": 4500,
        "total_referrals": 28,
        "conversion_rate": 5.2,
        "joined_at": "2024-06-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "total_pages": 8
    }
  }
}
```

---

### 1.4 Get Real-time Stats
Get real-time statistics for dashboard sync.

```http
GET /external/stats/realtime
```

**Response:**
```json
{
  "success": true,
  "data": {
    "timestamp": "2025-01-15T14:35:00Z",
    "today": {
      "total_visits": 234,
      "total_signups": 8,
      "total_investments": 3,
      "total_revenue": 1650
    },
    "active_visitors": 12,
    "top_sellers_today": [
      {
        "referral_code": "INF_ABC123",
        "visits": 45,
        "conversions": 2
      }
    ]
  }
}
```

---

## 2. APIs that MicroInfluencer PROVIDES (Safira calls these)

### Base URL
```
https://microinfluencer-platform.com/api/v1
```

### Authentication
```
Authorization: Bearer {MICROINFLUENCER_API_KEY}
X-Platform-ID: safira
```

---

### 2.1 Webhook: Tracking Events
Safira sends tracking events in real-time.

```http
POST /webhooks/safira-tracking
```

**Request Body:**
```json
{
  "event_type": "PAGE_VIEW | SIGNUP | INVESTMENT | PURCHASE | CLICK",
  "event_id": "evt_abc123",
  "timestamp": "2025-01-15T14:30:00Z",
  "utm_source": "INF_ABC123",
  "utm_medium": "instagram",
  "utm_campaign": "winter_sale",
  "utm_content": "story_link",
  "referral_code": "INF_ABC123",
  "visitor_id": "v_xyz789",
  "user_id": "usr_456",
  "session_id": "sess_123",
  "device_type": "mobile",
  "browser": "Chrome",
  "browser_version": "120.0",
  "os": "iOS",
  "os_version": "17.2",
  "country": "US",
  "city": "New York",
  "page_url": "https://safiralux.com/invest",
  "page_title": "Invest Now",
  "session_duration": 245,
  "scroll_depth": 85,
  "event_data": {
    "investment_amount": 100,
    "product_value": 600
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Event received",
  "event_id": "evt_abc123"
}
```

---

### 2.2 Webhook: Sale/Conversion Notification
Safira notifies when a sale/investment is completed.

```http
POST /webhooks/safira-conversion
```

**Request Body:**
```json
{
  "conversion_type": "INVESTMENT | PURCHASE",
  "conversion_id": "inv_123",
  "referral_code": "INF_ABC123",
  "timestamp": "2025-01-15T14:30:00Z",
  "customer": {
    "id": "usr_456",
    "email_hash": "sha256_hash",
    "is_new": true,
    "signup_date": "2025-01-15T14:25:00Z"
  },
  "transaction": {
    "amount": 100,
    "currency": "USD",
    "product_value": 600,
    "commission": 50,
    "commission_rate": 25
  },
  "product": {
    "id": "prod_789",
    "name": "Persian Pateh Art Investment",
    "type": "investment"
  },
  "attribution": {
    "first_click": "2025-01-10T10:00:00Z",
    "last_click": "2025-01-15T14:20:00Z",
    "total_visits": 5
  }
}
```

---

### 2.3 Get Influencer Info
Safira requests influencer details for verification.

```http
GET /influencers/{referralCode}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "referral_code": "INF_ABC123",
    "name": "John Doe",
    "email": "john@example.com",
    "status": "active",
    "tier": "gold",
    "social_profiles": {
      "instagram": "@johndoe",
      "tiktok": "@johndoe",
      "youtube": "JohnDoeChannel"
    },
    "commission_rate": 25,
    "payment_info": {
      "method": "crypto",
      "wallet_address": "0x..."
    }
  }
}
```

---

### 2.4 Sync Sellers List
Safira requests full list of active influencers to sync.

```http
GET /influencers/active
```

**Response:**
```json
{
  "success": true,
  "data": {
    "influencers": [
      {
        "referral_code": "INF_ABC123",
        "name": "John Doe",
        "status": "active",
        "tier": "gold",
        "commission_rate": 25,
        "joined_at": "2024-06-15T10:00:00Z"
      }
    ],
    "total": 156,
    "last_updated": "2025-01-15T00:00:00Z"
  }
}
```

---

### 2.5 Update Seller Stats (Batch)
Safira sends daily summary stats for all sellers.

```http
POST /webhooks/safira-daily-stats
```

**Request Body:**
```json
{
  "date": "2025-01-15",
  "sellers": [
    {
      "referral_code": "INF_ABC123",
      "visits": 45,
      "unique_visitors": 38,
      "signups": 3,
      "investments": 2,
      "purchases": 1,
      "revenue": 1100,
      "commission_earned": 275
    }
  ],
  "totals": {
    "total_visits": 1250,
    "total_revenue": 15400,
    "total_commissions": 3850
  }
}
```

---

## 3. Data Models

### Seller/Influencer Status
| Status | Description |
|--------|-------------|
| `pending` | Awaiting approval |
| `active` | Currently active |
| `inactive` | Temporarily disabled |
| `suspended` | Suspended for violation |

### Commission Tiers
| Tier | Rate | Requirements |
|------|------|--------------|
| bronze | 20% | Default |
| silver | 22% | 10+ sales |
| gold | 25% | 50+ sales |
| platinum | 30% | 100+ sales |

### Event Types
| Event | Description |
|-------|-------------|
| `PAGE_VIEW` | User viewed a page |
| `CLICK` | User clicked element |
| `SIGNUP` | User registered |
| `INVESTMENT` | User made investment |
| `PURCHASE` | User purchased product |
| `LOGIN_CLICK` | Login button clicked |
| `PAYMENT_CLICK` | Payment initiated |

---

## 4. Implementation Checklist

### Safira (This Platform) - TO DO:
- [x] Tracking events with UTM parameters
- [x] Send events to MicroInfluencer webhook
- [ ] Create `/api/v1/external/sellers` endpoint
- [ ] Create `/api/v1/external/sellers/{code}/analytics` endpoint
- [ ] Create `/api/v1/external/stats/realtime` endpoint
- [ ] Create Sellers dashboard page in admin panel
- [ ] Add seller sync cron job (daily)

### MicroInfluencer Platform - REQUIRED:
- [ ] Create `POST /webhooks/safira-tracking` endpoint
- [ ] Create `POST /webhooks/safira-conversion` endpoint
- [ ] Create `POST /webhooks/safira-daily-stats` endpoint
- [ ] Create `GET /influencers/{code}` endpoint
- [ ] Create `GET /influencers/active` endpoint
- [ ] Store Safira referral codes in influencer profiles
- [ ] Display Safira stats in influencer dashboard

---

## 5. Environment Variables

### Safira (.env)
```env
# MicroInfluencer Platform Integration
MICROINFLUENCER_API_URL=https://microinfluencer-platform.com/api/v1
MICROINFLUENCER_API_KEY=your_api_key_here
MICROINFLUENCER_WEBHOOK_SECRET=webhook_secret_for_verification
```

### MicroInfluencer Platform (.env)
```env
# Safira Integration
SAFIRA_API_URL=https://safiralux.com/api/v1/external
SAFIRA_API_KEY=safira_api_key_here
SAFIRA_WEBHOOK_SECRET=webhook_secret_for_verification
```

---

## 6. Security Considerations

1. **API Key Rotation**: Keys should be rotated every 90 days
2. **Webhook Verification**: Use HMAC signature for webhook payloads
3. **Rate Limiting**: Max 100 requests/minute per API key
4. **IP Whitelist**: Optional IP whitelist for production
5. **TLS**: All communication over HTTPS

### Webhook Signature Verification
```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}
```

---

## 7. Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid API key |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limited |
| 500 | Server Error - Internal error |

---

## 8. Contact

**Safira Technical Team**: tech@safiralux.com
**MicroInfluencer Platform**: api@microinfluencer.com

---

*Last Updated: December 2024*
*Version: 1.0*
