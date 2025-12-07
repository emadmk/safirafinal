# API Reference

Base URL: `https://safiralux.com/api`

---

## Authentication

All protected endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### POST /auth/register
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "country": "USA",
  "postalCode": "10001",
  "referredBy": "INF_ABC123"  // Optional referral code
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "referralCode": "REF_XYZ789"
  }
}
```

---

### POST /auth/login
Login existing user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

---

### GET /auth/me
Get current user info. **[Protected]**

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "USER",
  "referralCode": "REF_XYZ789",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

---

## Investment Endpoints

### GET /investments
Get user's investments. **[Protected]**

**Response:**
```json
{
  "investments": [
    {
      "id": "uuid",
      "userInvestment": 100,
      "companyInvestment": 250,
      "productValue": 600,
      "paymentStatus": "FINISHED",
      "productionStatus": "IN_PRODUCTION",
      "productionStage": 45,
      "createdAt": "2024-01-15T10:00:00Z",
      "investmentDate": "2024-01-15T12:00:00Z",
      "productionEndDate": "2024-07-15T12:00:00Z"
    }
  ]
}
```

---

### GET /investments/:id
Get single investment details. **[Protected]**

---

### POST /investments/create
Create new investment and get payment URL. **[Protected]**

**Response:**
```json
{
  "investment": {
    "id": "uuid",
    "paymentId": "INV-123456"
  },
  "invoiceUrl": "https://nowpayments.io/payment/..."
}
```

---

## Tracking Endpoints

### POST /tracking/event
Track analytics event.

**Request:**
```json
{
  "eventType": "PAGE_VIEW",
  "pageUrl": "https://safiralux.com/invest",
  "pageTitle": "Invest - Safira",
  "sessionId": "sess-uuid",
  "utm_source": "INF_ABC123",
  "utm_medium": "instagram",
  "ref": "INF_ABC123"
}
```

**Supported Event Types:**
- `PAGE_VIEW` - Page was viewed
- `SCROLL` - User scrolled (with scrollDepth)
- `CLICK` - Button/link clicked
- `SIGNUP` - User registered
- `INVESTMENT` - User initiated payment
- `PURCHASE` - User purchased from shop
- `SESSION_START` - Session started
- `SESSION_END` - Session ended
- `LOGIN_CLICK` - Login button clicked
- `PAYMENT_CLICK` - Payment button clicked
- `REGISTER_CLICK` - Register button clicked
- `REFERRAL_CLICK` - Referral link clicked

**Response:**
```json
{
  "success": true,
  "eventId": "uuid"
}
```

---

## Admin Endpoints

All admin endpoints require `ADMIN` or `SUPER_ADMIN` role.

### GET /admin/dashboard
Get dashboard statistics.

**Response:**
```json
{
  "stats": {
    "totalUsers": 150,
    "totalInvestments": 75,
    "totalRevenue": 7500,
    "pendingPayments": 5
  },
  "recentInvestments": [...],
  "recentUsers": [...]
}
```

---

### GET /admin/investments
Get all investments with filters.

**Query Parameters:**
- `status` - Filter by payment status
- `page` - Page number
- `limit` - Items per page

---

### PATCH /admin/investments/:id
Update investment status.

**Request:**
```json
{
  "productionStatus": "IN_PRODUCTION",
  "productionStage": 50,
  "productionNotes": "Weaving in progress"
}
```

---

### GET /admin/users
Get all users.

**Query Parameters:**
- `search` - Search by name/email
- `page`, `limit` - Pagination

---

### GET /admin/sellers
Get all sellers/influencers.

**Response:**
```json
{
  "sellers": [
    {
      "referralCode": "INF_ABC123",
      "pageViews": 150,
      "uniqueVisitors": 100,
      "signups": 10,
      "referredUsers": 5,
      "finishedInvestments": 2,
      "pendingInvestments": 1,
      "conversions": 2,
      "conversionRate": "2.00",
      "slotsUsed": 2,
      "slotsTotal": 20,
      "commissionEarned": 80,
      "status": "active",
      "firstActivity": "2024-01-10T08:00:00Z",
      "lastActivity": "2024-01-15T14:30:00Z"
    }
  ],
  "totals": {
    "totalSellers": 5,
    "totalPageViews": 500,
    "totalUniqueVisitors": 350,
    "totalConversions": 10,
    "totalCommissionEarned": 400
  }
}
```

---

### GET /admin/sellers?code=INF_ABC123
Get detailed seller info.

**Response:**
```json
{
  "referralCode": "INF_ABC123",
  "summary": {
    "totalUsers": 5,
    "totalFinishedInvestments": 2,
    "totalPendingInvestments": 1,
    "totalRevenue": 200,
    "totalCommission": 80,
    "byStatus": {
      "registered": 2,
      "pending_payment": 1,
      "invested": 2
    },
    "bySource": [
      { "source": "instagram", "count": 50 },
      { "source": "tiktok", "count": 30 }
    ],
    "byEvent": [
      { "event": "PAGE_VIEW", "count": 150 },
      { "event": "SIGNUP", "count": 5 }
    ]
  },
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "phone": "+1234567890",
      "location": "New York, USA",
      "registeredAt": "2024-01-15T10:00:00Z",
      "firstVisit": "2024-01-14T08:00:00Z",
      "lastActivity": "2024-01-15T14:30:00Z",
      "device": "mobile",
      "browser": "Chrome",
      "source": "instagram",
      "status": "invested",
      "totalInvestments": 1,
      "finishedInvestments": 1,
      "pendingInvestments": 0,
      "totalInvested": 100,
      "commissionEarned": 40,
      "investments": [
        {
          "id": "uuid",
          "amount": 100,
          "paymentStatus": "FINISHED",
          "productionStatus": "IN_PRODUCTION",
          "createdAt": "2024-01-15T10:00:00Z",
          "paidAt": "2024-01-15T12:00:00Z"
        }
      ]
    }
  ]
}
```

---

### GET /admin/tracking
Get analytics overview.

**Response:**
```json
{
  "summary": {
    "bySource": [
      { "source": "INF_ABC123", "count": 150 }
    ],
    "byEvent": [
      { "event": "PAGE_VIEW", "count": 500 }
    ],
    "byDevice": [
      { "device": "mobile", "count": 300 }
    ]
  },
  "funnel": {
    "visits": 500,
    "signups": 50,
    "investments": 10,
    "purchases": 5,
    "signupRate": "10.00",
    "investmentRate": "20.00"
  },
  "recentEvents": [...]
}
```

---

### GET /admin/tickets
Get all support tickets.

---

### POST /admin/tickets/:id/reply
Reply to a ticket. **[Admin]**

---

### GET /admin/payments
Get payment logs.

---

## External API (for MicroInfluencer Platform)

Base URL: `https://safiralux.com/api/v1/external`

### Authentication
```
X-Safira-Api-Key: safira-external-key-2024
```

---

### GET /v1/external/sellers
Get all sellers.

---

### GET /v1/external/sellers/:code
Get seller analytics by referral code.

---

### GET /v1/external/stats/realtime
Get real-time statistics.

**Response:**
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

## Payment Webhook (IPN)

### POST /payments/ipn
NowPayments IPN webhook.

**Headers:**
```
x-nowpayments-sig: <HMAC signature>
```

**Request Body (from NowPayments):**
```json
{
  "payment_id": "123456",
  "payment_status": "finished",
  "order_id": "INV-123456",
  "pay_amount": 100,
  "pay_currency": "BTC",
  "pay_address": "bc1..."
}
```

**Actions on FINISHED:**
1. Update investment status to FINISHED
2. Set production dates (6 months)
3. Send confirmation email
4. Send conversion webhook to MicroInfluencer

---

## Tickets Endpoints

### GET /tickets
Get user's tickets. **[Protected]**

---

### POST /tickets
Create new ticket. **[Protected]**

**Request:**
```json
{
  "subject": "Payment Issue",
  "message": "I have a problem with...",
  "category": "payment"
}
```

---

### POST /tickets/:id/reply
Reply to ticket. **[Protected]**

---

## User Profile

### GET /users/profile
Get user profile. **[Protected]**

---

### PATCH /users/profile
Update user profile. **[Protected]**

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "country": "USA",
  "postalCode": "10001"
}
```

---

## Referrals

### GET /referrals
Get user's referral stats. **[Protected]**

**Response:**
```json
{
  "referrals": [
    {
      "id": "uuid",
      "firstName": "Jane",
      "lastName": "Doe",
      "joinedAt": "2024-01-15T10:00:00Z",
      "hasInvested": true,
      "totalInvestments": 1,
      "potentialEarnings": 250
    }
  ],
  "totalReferrals": 5,
  "totalEarnings": 1250
}
```

---

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message",
  "details": [...] // Optional, for validation errors
}
```

**Common Status Codes:**
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `405` - Method Not Allowed
- `500` - Internal Server Error
