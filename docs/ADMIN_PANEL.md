# Admin Panel Documentation

## Access Requirements

- **Role**: `ADMIN` or `SUPER_ADMIN`
- **URL**: `https://safiralux.com/admin`
- **Authentication**: JWT token required

---

## Admin Dashboard

**Route**: `/admin`
**File**: `frontend/src/pages/admin/AdminDashboard.tsx`

### Overview Stats
| Stat | Description |
|------|-------------|
| Total Users | All registered users |
| Total Investments | All investment records |
| Total Revenue | Sum of FINISHED payments |
| Pending Payments | Investments awaiting payment |

### Recent Activity
- Latest 10 investments
- Latest 10 user registrations

---

## Investments Management

**Route**: `/admin/investments`
**API**: `GET /admin/investments`, `PATCH /admin/investments/:id`

### Features
- View all investments
- Filter by payment status
- Update production status
- Track production progress (0-100%)
- Add production notes

### Production Stages

| Stage | Description | Progress Range |
|-------|-------------|----------------|
| PENDING_PAYMENT | Awaiting payment | 0% |
| QUEUED | In production queue | 1-10% |
| IN_PRODUCTION | Active crafting | 10-70% |
| QUALITY_CHECK | Quality inspection | 70-85% |
| FRAMING | Final framing | 85-99% |
| COMPLETED | Ready for sale | 100% |

### Update Investment
```json
PATCH /admin/investments/:id
{
  "productionStatus": "IN_PRODUCTION",
  "productionStage": 45,
  "productionNotes": "Weaving phase 2 complete"
}
```

---

## Products Management

**Route**: `/admin/products`
**API**: `GET /admin/products`, `POST /admin/products`, `PATCH /admin/products/:id`

### Features
- List all products
- Add new products
- Edit product details
- Upload product images
- Set availability
- Mark as featured

### Product Fields
```json
{
  "name": "Persian Pateh - Mountain Design",
  "description": "Handcrafted pateh with mountain motif...",
  "price": 550,
  "originalPrice": 600,
  "images": ["https://..."],
  "isAvailable": true,
  "isFeatured": false,
  "material": "100% Natural Wool",
  "dimensions": "100cm x 150cm",
  "weight": "2.5kg",
  "craftsman": "Master Ali"
}
```

---

## Users Management

**Route**: `/admin/users`
**API**: `GET /admin/users`

### Features
- List all users
- Search by name/email
- View user details
- See user's investments
- View referral information

### Search
```
GET /admin/users?search=john@example.com
GET /admin/users?search=John
```

### User Details
- Personal information
- Contact details
- Referral code
- Who referred them
- Investment history

---

## Tickets Management

**Route**: `/admin/tickets`
**API**: `GET /admin/tickets`, `POST /admin/tickets/:id/reply`

### Features
- View all support tickets
- Filter by status
- Respond to tickets
- Change ticket status
- Set priority

### Ticket Statuses
| Status | Description |
|--------|-------------|
| OPEN | New, unread ticket |
| IN_PROGRESS | Being worked on |
| WAITING_REPLY | Waiting for user response |
| RESOLVED | Issue fixed |
| CLOSED | Ticket closed |

### Reply to Ticket
```json
POST /admin/tickets/:id/reply
{
  "message": "Thank you for contacting us..."
}
```

---

## Payment Logs

**Route**: `/admin/payments`
**API**: `GET /admin/payments`

### Features
- View all payment attempts
- NowPayments IPN logs
- Debug payment issues
- Status history

### Log Fields
- NowPayments ID
- Payment status
- Payment type (investment/purchase)
- Related investment/sale ID
- Full IPN payload
- Timestamp

---

## Sellers / Influencers

**Route**: `/admin/sellers`
**File**: `frontend/src/pages/admin/AdminSellers.tsx`
**API**: `GET /admin/sellers`

### Overview Page

Shows all sellers/influencers with:

| Column | Description |
|--------|-------------|
| Referral Code | INF_XXXXX |
| Status | pending/active/ready_payout |
| Users | Number of referred users |
| Visitors | Unique visitors |
| Paid | Finished investments |
| Pending | Pending investments |
| Commission | Earned commission ($) |
| Last Active | Last activity timestamp |

### Summary Stats
- Total Sellers
- Total Visitors
- Paid Conversions
- Commission Earned
- Sellers Ready for Payout

### Payout Alert
Shows when sellers have 20+ conversions and are ready for payout.

---

## Seller Detail Page

**Route**: `/admin/sellers/:code`
**File**: `frontend/src/pages/admin/AdminSellerDetail.tsx`
**API**: `GET /admin/sellers?code=INF_XXXXX`

### Summary Cards
- Total Users
- Total Invested
- Total Commission
- Finished Payments
- Pending Payments

### Referral Links Section
Pre-generated links for all platforms:
- Instagram
- TikTok
- YouTube
- Twitter/X
- Facebook
- LinkedIn
- Blog/Website
- Other

### Users Table

| Column | Description |
|--------|-------------|
| User | Name, email, phone |
| Location | City, Country |
| Device | mobile/desktop |
| Source | UTM medium |
| Status | registered/pending_payment/invested |
| Commission | Earned from this user |
| Actions | Expand to see investments |

### Status Badges
- **Registered** (yellow): User signed up but no investment
- **Pending** (blue): Has pending investment
- **Invested** (green): Has finished investment

### Expandable Investment Details
Each user row can expand to show:
- Investment ID
- Amount
- Payment status
- Production status
- Created date
- Paid date

### Traffic Source Breakdown
Chart/list showing:
- instagram: 50%
- tiktok: 30%
- youtube: 10%
- other: 10%

### Event Breakdown
- PAGE_VIEW: 150
- SIGNUP: 10
- INVESTMENT: 5

---

## Analytics / Tracking

**Route**: `/admin/tracking`
**API**: `GET /admin/tracking`

### Funnel Visualization
```
Visits: 500
   ↓ (10%)
Signups: 50
   ↓ (20%)
Investments: 10
   ↓ (50%)
Purchases: 5
```

### Metrics
| Metric | Calculation |
|--------|-------------|
| Signup Rate | signups / visits * 100 |
| Investment Rate | investments / signups * 100 |
| Purchase Rate | purchases / signups * 100 |

### Source Breakdown
Top traffic sources with counts.

### Device Breakdown
- Mobile: 60%
- Desktop: 35%
- Tablet: 5%

### Recent Events
Timeline of latest tracking events.

---

## API Reference

### GET /admin/dashboard
```json
Response:
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

### GET /admin/investments
```
Query: ?status=PENDING&page=1&limit=20

Response:
{
  "investments": [...],
  "pagination": {
    "total": 75,
    "page": 1,
    "limit": 20,
    "pages": 4
  }
}
```

### PATCH /admin/investments/:id
```json
Request:
{
  "productionStatus": "IN_PRODUCTION",
  "productionStage": 50,
  "productionNotes": "Progress update"
}

Response:
{
  "success": true,
  "investment": {...}
}
```

### GET /admin/users
```
Query: ?search=john&page=1&limit=20

Response:
{
  "users": [...],
  "pagination": {...}
}
```

### GET /admin/sellers
```json
Response:
{
  "sellers": [
    {
      "referralCode": "INF_ABC123",
      "totalEvents": 200,
      "pageViews": 150,
      "uniqueVisitors": 100,
      "signups": 10,
      "investmentClicks": 5,
      "referredUsers": 8,
      "finishedInvestments": 2,
      "pendingInvestments": 1,
      "conversions": 2,
      "conversionRate": "2.00",
      "slotsUsed": 2,
      "slotsTotal": 20,
      "commissionEarned": 80,
      "pendingCommission": 0,
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
    "totalCommissionEarned": 400,
    "totalPendingCommission": 0,
    "sellersReadyForPayout": 0
  }
}
```

### GET /admin/sellers?code=INF_ABC123
```json
Response:
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
      { "source": "instagram", "count": 50 }
    ],
    "byEvent": [
      { "event": "PAGE_VIEW", "count": 150 }
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

### GET /admin/tracking
```json
Response:
{
  "summary": {
    "bySource": [...],
    "byEvent": [...],
    "byDevice": [...]
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

## Admin Layout Navigation

Menu items in `AdminLayout.tsx`:

```typescript
const menuItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/investments', icon: TrendingUp, label: 'Investments' },
  { path: '/admin/products', icon: Package, label: 'Products' },
  { path: '/admin/users', icon: Users, label: 'Users' },
  { path: '/admin/tickets', icon: MessageSquare, label: 'Tickets' },
  { path: '/admin/payments', icon: CreditCard, label: 'Payments' },
  { path: '/admin/sellers', icon: UserPlus, label: 'Sellers' },
  { path: '/admin/tracking', icon: BarChart3, label: 'Analytics' },
];
```

---

## Security

All admin endpoints are protected by:

1. **JWT Authentication** - Valid token required
2. **Role Check** - `requireAdmin()` middleware
3. **Permission Verification** - ADMIN or SUPER_ADMIN role

```typescript
// backend/src/lib/auth.ts
export const requireAdmin = (handler) => async (req, res) => {
  const user = await verifyToken(req);

  if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  req.user = user;
  return handler(req, res);
};
```

