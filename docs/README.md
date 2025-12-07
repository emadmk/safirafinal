# Safira Luxury Platform - Complete Documentation

## Overview

Safira Luxury is a luxury Pateh art investment e-commerce platform built with:

- **Backend**: Next.js API Routes + Prisma ORM + PostgreSQL
- **Frontend**: Vite + React + TypeScript + Tailwind CSS
- **Payment**: NowPayments (Crypto)
- **Domain**: safiralux.com

---

## Table of Contents

1. [Architecture Overview](./ARCHITECTURE.md)
2. [API Reference](./API_REFERENCE.md)
3. [Frontend Pages](./FRONTEND_PAGES.md)
4. [Database Schema](./DATABASE_SCHEMA.md)
5. [Tracking & Analytics](./TRACKING_ANALYTICS.md)
6. [MicroInfluencer Integration](./MICROINFLUENCER_API_INTEGRATION.md)
7. [Admin Panel](./ADMIN_PANEL.md)
8. [Cheat Sheet](./CHEAT_SHEET.md)

---

## Quick Start

### Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev  # Port 3001
```

### Frontend
```bash
cd frontend
npm install
npm run dev  # Port 5173
```

### Production
```bash
# Backend
cd backend && npm run build
pm2 start npm --name safira-backend -- start

# Frontend
cd frontend && npm run build
# Serve dist folder with nginx
```

---

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/safira"
JWT_SECRET="your-jwt-secret"
NOWPAYMENTS_API_KEY="your-nowpayments-key"
NOWPAYMENTS_IPN_SECRET="your-ipn-secret"

# MicroInfluencer Integration
EXTERNAL_API_KEY=safira-external-key-2024
MICROINFLUENCER_API_URL=https://arsalan.safiralux.com/api/v1
MICROINFLUENCER_API_KEY=microinfluencer-key-2024
```

### Frontend (.env)
```env
VITE_API_URL=https://safiralux.com/api
```

---

## Key Features

### For Users
- Investment in Pateh art ($100 investment → $600 product value)
- Crypto payment (Bitcoin, Ethereum, USDT, etc.)
- Dashboard with investment tracking
- Production timeline (6 months)
- Sale period tracking
- Referral system
- Support tickets

### For Admin
- Investment management
- User management
- Product catalog
- Payment tracking
- Seller/Influencer analytics
- Support ticket handling

### For Influencers
- Referral tracking via UTM parameters
- Commission system ($40 per conversion)
- 20 slots = $800 payout cycle
- Traffic source breakdown (Instagram, TikTok, YouTube, etc.)

---

## File Structure

```
safirafinal/
├── backend/
│   ├── src/
│   │   ├── lib/
│   │   │   ├── prisma.ts         # Prisma client
│   │   │   ├── auth.ts           # Authentication
│   │   │   ├── tracking.ts       # Analytics & webhooks
│   │   │   ├── externalAuth.ts   # External API auth
│   │   │   ├── nowpayment.ts     # Payment integration
│   │   │   └── email.ts          # Email templates
│   │   └── pages/api/
│   │       ├── auth/             # Login, Register, Me
│   │       ├── admin/            # Admin endpoints
│   │       ├── investments/      # Investment CRUD
│   │       ├── tracking/         # Analytics events
│   │       ├── payments/         # IPN webhook
│   │       ├── tickets/          # Support system
│   │       ├── shop/             # Product catalog
│   │       ├── users/            # User profile
│   │       └── v1/external/      # External API
│   └── prisma/
│       └── schema.prisma         # Database schema
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── layouts/          # Dashboard & Admin layouts
│   │   ├── pages/
│   │   │   ├── admin/            # Admin pages
│   │   │   ├── Landing.tsx       # Home page
│   │   │   ├── Invest.tsx        # Investment flow
│   │   │   ├── Dashboard.tsx     # User dashboard
│   │   │   └── ...
│   │   ├── lib/
│   │   │   ├── api.ts            # Axios instance
│   │   │   └── tracking.ts       # Frontend tracking
│   │   └── store/
│   │       └── authStore.ts      # Zustand auth store
│   └── public/
│       └── logo.png
│
└── docs/                         # Documentation
```

---

## Contact

- Website: safiralux.com
- MicroInfluencer Platform: arsalan.safiralux.com
