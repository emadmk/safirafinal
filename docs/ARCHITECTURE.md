# Architecture Documentation

## System Overview

Safira Lux is a luxury e-commerce platform for Persian Pateh art, featuring an investment model where users co-invest with the company in handcrafted artworks.

```
                    ┌─────────────────┐
                    │   CloudFlare    │
                    │   (CDN + DNS)   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │     Nginx       │
                    │  (Reverse Proxy)│
                    └───┬─────────┬───┘
                        │         │
         ┌──────────────▼──┐  ┌───▼──────────────┐
         │    Frontend     │  │     Backend      │
         │  (Port 5173)    │  │   (Port 3001)    │
         │   Vite + React  │  │  Next.js API     │
         └─────────────────┘  └────────┬─────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
           ┌────────▼────────┐ ┌───────▼───────┐ ┌───────▼───────┐
           │   PostgreSQL    │ │  NowPayments  │ │ MicroInfluencer│
           │   (Database)    │ │  (Payments)   │ │  (Analytics)   │
           └─────────────────┘ └───────────────┘ └────────────────┘
```

---

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand (authStore)
- **Animations**: Framer Motion
- **HTTP Client**: Axios
- **Routing**: React Router v6

### Backend
- **Framework**: Next.js 14 (API Routes only)
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod
- **User Agent Parsing**: ua-parser-js

### Infrastructure
- **Server**: Ubuntu 22.04 (141.11.1.85)
- **Domain**: safiralux.com
- **Process Manager**: PM2
- **Web Server**: Nginx
- **SSL**: Let's Encrypt via CloudFlare

---

## Project Structure

```
safirafinal/
├── frontend/                    # React application
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   │   ├── layouts/         # DashboardLayout, AdminLayout
│   │   │   └── ui/              # Button, Input, Card, etc.
│   │   ├── lib/
│   │   │   ├── api.ts           # Axios instance
│   │   │   └── tracking.ts      # Analytics tracking
│   │   ├── pages/               # Page components
│   │   │   ├── admin/           # Admin panel pages
│   │   │   └── *.tsx            # User pages
│   │   ├── store/
│   │   │   └── authStore.ts     # Zustand auth store
│   │   ├── App.tsx              # Route definitions
│   │   └── main.tsx             # Entry point
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── backend/                     # Next.js API
│   ├── prisma/
│   │   └── schema.prisma        # Database schema
│   ├── src/
│   │   ├── lib/
│   │   │   ├── auth.ts          # JWT auth helpers
│   │   │   ├── prisma.ts        # Prisma client
│   │   │   ├── tracking.ts      # Analytics & webhooks
│   │   │   └── externalAuth.ts  # External API auth
│   │   └── pages/api/           # API endpoints
│   │       ├── auth/            # Authentication
│   │       ├── admin/           # Admin endpoints
│   │       ├── investments/     # Investment CRUD
│   │       ├── payments/        # Payment webhooks
│   │       ├── tracking/        # Analytics events
│   │       └── v1/external/     # External API
│   └── next.config.js
│
└── docs/                        # Documentation
```

---

## Authentication Flow

### User Authentication (JWT)

```
┌─────────┐         ┌─────────┐         ┌─────────┐
│ Client  │         │ Backend │         │   DB    │
└────┬────┘         └────┬────┘         └────┬────┘
     │                   │                   │
     │ POST /auth/login  │                   │
     │──────────────────>│                   │
     │                   │ Query user        │
     │                   │──────────────────>│
     │                   │<──────────────────│
     │                   │                   │
     │                   │ Verify password   │
     │                   │ Generate JWT      │
     │                   │                   │
     │   { token, user } │                   │
     │<──────────────────│                   │
     │                   │                   │
     │ GET /auth/me      │                   │
     │ (Bearer token)    │                   │
     │──────────────────>│                   │
     │                   │ Verify JWT        │
     │                   │──────────────────>│
     │   { user }        │<──────────────────│
     │<──────────────────│                   │
```

### Token Structure
```typescript
interface JWTPayload {
  userId: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  iat: number;
  exp: number;
}
```

### Role-Based Access
- **USER**: Dashboard, Investments, Profile, Tickets
- **ADMIN**: All user routes + Admin Panel (read/write)
- **SUPER_ADMIN**: All admin routes + System Settings

---

## Investment Lifecycle

```
                 ┌──────────────────┐
                 │   User Starts    │
                 │   Investment     │
                 └────────┬─────────┘
                          │
                 ┌────────▼─────────┐
                 │  Create Payment  │
                 │  (NowPayments)   │
                 └────────┬─────────┘
                          │
                 ┌────────▼─────────┐
                 │ Payment Status:  │
                 │    PENDING       │
                 └────────┬─────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
   ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
   │  CONFIRMING │ │  CONFIRMED  │ │   EXPIRED   │
   └──────┬──────┘ └──────┬──────┘ └─────────────┘
          │               │
          └───────┬───────┘
                  │
         ┌────────▼────────┐
         │    FINISHED     │
         │ Payment Complete│
         └────────┬────────┘
                  │
         ┌────────▼────────┐
         │  Start 6-Month  │
         │   Production    │
         └────────┬────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼───┐   ┌─────▼─────┐   ┌───▼───┐
│ QUEUED │   │ IN_PROD  │   │ CHECK │
└───┬───┘   └─────┬─────┘   └───┬───┘
    │             │             │
    └─────────────┼─────────────┘
                  │
         ┌────────▼────────┐
         │   COMPLETED     │
         │  Ready to Sell  │
         └────────┬────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼────┐  ┌─────▼──────┐ ┌────▼─────┐
│INVESTOR│  │  COMPANY   │ │GUARANTEED│
│  SOLD  │  │   SOLD     │ │ DELIVERY │
└────────┘  └────────────┘ └──────────┘
```

### Production Stages (0-100%)
- 0-10%: Design & Planning
- 10-30%: Material Preparation
- 30-70%: Weaving/Crafting
- 70-85%: Quality Check
- 85-100%: Framing & Finishing

---

## Payment Integration

### NowPayments Flow

```
┌──────────┐    ┌─────────┐    ┌────────────┐    ┌─────────┐
│  Client  │    │ Backend │    │ NowPayments│    │   IPN   │
└────┬─────┘    └────┬────┘    └──────┬─────┘    └────┬────┘
     │               │                │               │
     │ Create Invest │                │               │
     │──────────────>│                │               │
     │               │ Create Invoice │               │
     │               │───────────────>│               │
     │               │  Invoice URL   │               │
     │               │<───────────────│               │
     │  Invoice URL  │                │               │
     │<──────────────│                │               │
     │               │                │               │
     │ [User pays]   │                │               │
     │ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─>│               │
     │               │                │               │
     │               │                │ IPN Webhook   │
     │               │                │──────────────>│
     │               │                │               │
     │               │                │ Update Status │
     │               │<───────────────┼───────────────│
     │               │                │               │
     │               │ Send Email     │               │
     │               │ Send Webhook   │               │
```

### IPN Status Mapping
```typescript
// NowPayments status → Internal status
'waiting' → 'PENDING'
'confirming' → 'CONFIRMING'
'confirmed' → 'CONFIRMED'
'sending' → 'SENDING'
'partially_paid' → 'PARTIALLY_PAID'
'finished' → 'FINISHED'
'failed' → 'FAILED'
'refunded' → 'REFUNDED'
'expired' → 'EXPIRED'
```

---

## Analytics & Tracking

### Event Flow

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌───────────────┐
│ Browser │    │Frontend │    │ Backend │    │MicroInfluencer│
└────┬────┘    └────┬────┘    └────┬────┘    └───────┬───────┘
     │              │              │                 │
     │ Page Load    │              │                 │
     │─────────────>│              │                 │
     │              │ initTracking │                 │
     │              │─────────────>│                 │
     │              │              │ Store Event     │
     │              │              │                 │
     │              │              │ If UTM Source   │
     │              │              │────────────────>│
     │              │              │                 │
     │ User Action  │              │                 │
     │─────────────>│              │                 │
     │              │ trackEvent() │                 │
     │              │─────────────>│                 │
     │              │              │────────────────>│
```

### Event Types
| Event | Trigger | Data |
|-------|---------|------|
| PAGE_VIEW | Page load | URL, title |
| SCROLL | Scroll depth | Depth % |
| CLICK | Button click | Element ID |
| SIGNUP | Registration | Referral code |
| INVESTMENT | Payment init | Amount |
| PURCHASE | Shop purchase | Product ID |
| SESSION_START | First visit | - |
| SESSION_END | Tab close | Duration |

---

## External API (MicroInfluencer Integration)

### Authentication
```
X-Safira-Api-Key: safira-external-key-2024
```

### Webhook Endpoints (Outgoing)

1. **Tracking Events**: `POST /webhooks/safira-tracking`
   - Sent on every tracked event with UTM source

2. **Conversions**: `POST /webhooks/safira-conversion`
   - Sent when payment is FINISHED

3. **Daily Stats**: `POST /webhooks/safira-daily-stats`
   - Sent via cron job (optional)

### API Endpoints (Incoming)

1. `GET /v1/external/sellers` - List all sellers
2. `GET /v1/external/sellers/:code` - Seller analytics
3. `GET /v1/external/stats/realtime` - Real-time stats

---

## Commission System

### Slots & Earnings
```
Per Influencer:
├── 20 slots maximum
├── $40 per finished investment
├── $800 maximum per influencer
└── Excess conversions → pending queue

Commission Calculation:
├── Only FINISHED payments count
├── Pending payments don't earn commission
└── Commission tracked per-user, not per-event
```

### Status Mapping
- `pending`: No finished investments yet
- `active`: Has 1-19 finished investments
- `ready_payout`: Has 20+ finished investments

---

## Environment Variables

### Backend (.env)
```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/safira"

# JWT
JWT_SECRET="your-secret-key"

# NowPayments
NOWPAYMENTS_API_KEY="your-api-key"
NOWPAYMENTS_IPN_SECRET="your-ipn-secret"

# MicroInfluencer
MICROINFLUENCER_API_URL="https://microinfluencer.com/api"
MICROINFLUENCER_API_KEY="safira-external-key-2024"

# Email (optional)
SMTP_HOST="smtp.example.com"
SMTP_USER="user"
SMTP_PASS="pass"
```

### Frontend (.env)
```bash
VITE_API_URL="https://safiralux.com/api"
```

---

## Deployment

### PM2 Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'safira-backend',
      script: 'npm',
      args: 'start',
      cwd: '/home/user/safirafinal/backend',
      env: { PORT: 3001 }
    },
    {
      name: 'safira-frontend',
      script: 'npm',
      args: 'run preview',
      cwd: '/home/user/safirafinal/frontend',
      env: { PORT: 5173 }
    }
  ]
}
```

### Nginx Configuration
```nginx
server {
    listen 443 ssl;
    server_name safiralux.com;

    location / {
        proxy_pass http://localhost:5173;
    }

    location /api {
        proxy_pass http://localhost:3001;
    }
}
```

---

## Security Measures

1. **Authentication**: JWT with expiration
2. **Password Hashing**: bcrypt
3. **Input Validation**: Zod schemas
4. **CORS**: Configured for specific origins
5. **Rate Limiting**: Nginx level
6. **SQL Injection**: Prisma ORM parameterized queries
7. **XSS Prevention**: React auto-escaping
8. **HTTPS**: Enforced via CloudFlare

