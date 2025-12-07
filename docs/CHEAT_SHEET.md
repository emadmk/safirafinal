# Safira Cheat Sheet

Quick reference for common operations.

---

## Deployment Commands

### Pull & Deploy
```bash
cd /home/user/safirafinal
git pull origin main

# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run build

# Frontend
cd ../frontend
npm install
npm run build

# Restart services
pm2 restart safira-backend safira-frontend
```

### Quick Restart
```bash
pm2 restart all
```

### View Logs
```bash
pm2 logs safira-backend
pm2 logs safira-frontend
pm2 logs               # All logs
```

---

## Database Commands

### Prisma
```bash
cd backend

# Generate client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Deploy migrations
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio

# Reset database (DANGER!)
npx prisma migrate reset
```

### PostgreSQL Direct
```bash
# Connect to database
psql -U postgres -d safira

# Common queries
SELECT * FROM "User" LIMIT 10;
SELECT * FROM "Investment" WHERE "paymentStatus" = 'FINISHED';
SELECT * FROM "TrackingEvent" WHERE "utmSource" IS NOT NULL LIMIT 50;
```

---

## API Testing

### Auth
```bash
# Register
curl -X POST https://safiralux.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","firstName":"Test","lastName":"User"}'

# Login
curl -X POST https://safiralux.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Get current user
curl https://safiralux.com/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Tracking
```bash
# Send tracking event
curl -X POST https://safiralux.com/api/tracking/event \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "PAGE_VIEW",
    "pageUrl": "https://safiralux.com/invest?utm_source=TEST_123",
    "utm_source": "TEST_123",
    "utm_medium": "test"
  }'
```

### External API
```bash
# Get all sellers
curl https://safiralux.com/api/v1/external/sellers \
  -H "X-Safira-Api-Key: safira-external-key-2024"

# Get seller details
curl https://safiralux.com/api/v1/external/sellers/INF_ABC123 \
  -H "X-Safira-Api-Key: safira-external-key-2024"

# Get real-time stats
curl https://safiralux.com/api/v1/external/stats/realtime \
  -H "X-Safira-Api-Key: safira-external-key-2024"
```

---

## Referral Links

### Format
```
https://safiralux.com/invest?utm_source={CODE}&utm_medium={PLATFORM}
```

### Platforms
```
instagram
tiktok
youtube
twitter
facebook
linkedin
blog
email
other
```

### Example
```
https://safiralux.com/invest?utm_source=INF_ABC123&utm_medium=instagram
```

---

## Commission Quick Reference

| Item | Value |
|------|-------|
| Commission per sale | $40 |
| Max slots per seller | 20 |
| Max commission | $800 |
| Only counts | FINISHED payments |

### Status Meanings
- `pending`: No finished investments
- `active`: 1-19 finished investments
- `ready_payout`: 20+ finished investments

---

## Payment Status Flow

```
PENDING → CONFIRMING → CONFIRMED → SENDING → FINISHED
                  ↘                        ↘
               FAILED                   EXPIRED
```

### Key Status
- **PENDING**: Waiting for payment
- **FINISHED**: Payment complete, commission counts
- **EXPIRED**: Payment window closed

---

## Production Status Flow

```
PENDING_PAYMENT → QUEUED → IN_PRODUCTION → QUALITY_CHECK → FRAMING → COMPLETED
```

### Progress Mapping
| Status | Stage |
|--------|-------|
| PENDING_PAYMENT | 0% |
| QUEUED | 1-10% |
| IN_PRODUCTION | 10-70% |
| QUALITY_CHECK | 70-85% |
| FRAMING | 85-99% |
| COMPLETED | 100% |

---

## Event Types Quick Reference

| Event | When |
|-------|------|
| PAGE_VIEW | Page loads |
| SIGNUP | User registers |
| INVESTMENT | Payment started |
| PURCHASE | Shop payment |
| CLICK | Button clicked |
| SCROLL | User scrolled |

---

## File Locations

### Backend
```
backend/
├── prisma/schema.prisma     # Database schema
├── src/lib/
│   ├── auth.ts              # JWT auth
│   ├── prisma.ts            # DB client
│   ├── tracking.ts          # Analytics
│   └── externalAuth.ts      # External API auth
├── src/pages/api/
│   ├── auth/                # Auth endpoints
│   ├── admin/               # Admin endpoints
│   ├── investments/         # Investment CRUD
│   ├── payments/ipn.ts      # Payment webhook
│   ├── tracking/event.ts    # Track events
│   └── v1/external/         # External API
└── .env                     # Environment vars
```

### Frontend
```
frontend/
├── src/lib/
│   ├── api.ts               # Axios client
│   └── tracking.ts          # Client tracking
├── src/pages/
│   ├── admin/               # Admin pages
│   ├── Invest.tsx           # Investment page
│   └── *.tsx                # Other pages
├── src/store/authStore.ts   # Auth state
└── .env                     # Environment vars
```

---

## Environment Variables

### Backend (.env)
```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/safira"
JWT_SECRET="your-secret"
NOWPAYMENTS_API_KEY="..."
NOWPAYMENTS_IPN_SECRET="..."
MICROINFLUENCER_API_URL="https://..."
MICROINFLUENCER_API_KEY="safira-external-key-2024"
```

### Frontend (.env)
```bash
VITE_API_URL="https://safiralux.com/api"
```

---

## Common Issues

### Tracking not working
1. Check `initTracking()` called on page load
2. Verify UTM params in URL
3. Check backend logs: `pm2 logs safira-backend`
4. Verify eventType in allowed list

### Commission showing wrong
1. Confirm counting FINISHED only
2. Check user.referredBy matches utmSource
3. Verify investment.paymentStatus

### Webhook not sending
1. Check MICROINFLUENCER_API_URL set
2. Check MICROINFLUENCER_API_KEY set
3. Look for "[MicroInfluencer]" in logs

### Payment not updating
1. Check NowPayments IPN endpoint
2. Verify HMAC signature
3. Check PaymentLog table
4. Review IPN data in logs

---

## Quick Queries

### Count sellers
```sql
SELECT "utmSource", COUNT(*) as events
FROM "TrackingEvent"
WHERE "utmSource" IS NOT NULL
GROUP BY "utmSource"
ORDER BY events DESC;
```

### Get finished investments by referral
```sql
SELECT u."referredBy", COUNT(*) as finished
FROM "Investment" i
JOIN "User" u ON i."userId" = u.id
WHERE i."paymentStatus" = 'FINISHED'
AND u."referredBy" IS NOT NULL
GROUP BY u."referredBy";
```

### Recent events
```sql
SELECT "eventType", "utmSource", "createdAt"
FROM "TrackingEvent"
ORDER BY "createdAt" DESC
LIMIT 20;
```

### User journey
```sql
SELECT *
FROM "TrackingEvent"
WHERE "userId" = 'user-uuid-here'
ORDER BY "createdAt";
```

---

## PM2 Commands

```bash
pm2 list                  # Show all processes
pm2 restart all           # Restart all
pm2 restart safira-backend
pm2 restart safira-frontend
pm2 logs                  # All logs
pm2 logs safira-backend   # Backend logs
pm2 logs --lines 100      # Last 100 lines
pm2 monit                 # Real-time monitor
pm2 save                  # Save current config
```

---

## Nginx Commands

```bash
sudo nginx -t             # Test config
sudo systemctl reload nginx
sudo systemctl restart nginx
sudo tail -f /var/log/nginx/error.log
```

---

## Git Quick Commands

```bash
git status
git pull origin main
git add .
git commit -m "message"
git push origin main

# View recent commits
git log --oneline -10
```

---

## URLs

| Environment | URL |
|-------------|-----|
| Production | https://safiralux.com |
| Admin Panel | https://safiralux.com/admin |
| API | https://safiralux.com/api |
| External API | https://safiralux.com/api/v1/external |

---

## Support Contacts

- Server IP: 141.11.1.85
- Domain: safiralux.com
- SSL: CloudFlare (automatic)

