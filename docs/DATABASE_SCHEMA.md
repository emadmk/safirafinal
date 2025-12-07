# Database Schema Documentation

## Overview

Safira uses PostgreSQL with Prisma ORM. The database is defined in `backend/prisma/schema.prisma`.

**Connection**: Set via `DATABASE_URL` environment variable.

---

## Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│    User     │──────<│  Investment  │>──────│   Product   │
└─────┬───────┘       └──────┬───────┘       └─────────────┘
      │                      │
      │                      │
      │               ┌──────┴───────┐
      │               │     Sale     │
      │               └──────────────┘
      │
      ├──────────────<│    Ticket    │>──────<│ TicketReply │
      │               └──────────────┘        └─────────────┘
      │
      └──────────────<│TrackingEvent │
                      └──────────────┘

                      ┌──────────────┐
                      │  PaymentLog  │
                      └──────────────┘

                      ┌──────────────┐
                      │   Setting    │
                      └──────────────┘
```

---

## Models

### User

Stores investor/user accounts.

```prisma
model User {
  id              String    @id @default(uuid())
  email           String    @unique
  password        String                          // bcrypt hashed
  firstName       String
  lastName        String
  phone           String?
  address         String?
  city            String?
  country         String?
  postalCode      String?
  referralCode    String    @unique @default(uuid())  // For referring others
  referredBy      String?                         // Code of who referred them
  role            Role      @default(USER)
  isEmailVerified Boolean   @default(false)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  investments     Investment[]
  tickets         Ticket[]
  ticketReplies   TicketReply[]
  trackingEvents  TrackingEvent[]
  referralSales   Sale[]    @relation("ReferralSales")

  @@index([referralCode])
  @@index([email])
}
```

**Important Fields**:
- `referralCode`: User's unique referral code (auto-generated UUID)
- `referredBy`: Stores the referral/influencer code used at signup (e.g., `INF_ABC123`)

---

### Investment

Core business model - user's investment in a product.

```prisma
model Investment {
  id                    String    @id @default(uuid())
  userId                String
  user                  User      @relation(...)

  // Investment amounts
  userInvestment        Float     @default(100)   // User pays $100
  companyInvestment     Float     @default(250)   // Company adds $250
  productValue          Float     @default(600)   // Total product value

  // Payment tracking
  paymentId             String?   @unique         // Internal ID (INV-XXXXXX)
  paymentStatus         PaymentStatus @default(PENDING)
  paymentMethod         String?
  paymentCurrency       String?
  paymentAmount         Float?
  paymentAddress        String?
  nowPaymentId          String?   @unique         // NowPayments ID

  // Timeline
  investmentDate        DateTime?                 // When payment finished
  productionStartDate   DateTime?
  productionEndDate     DateTime?                 // +6 months
  saleStartDate         DateTime?
  saleEndDate           DateTime?                 // +2 months from sale start

  // Production tracking
  productionStatus      ProductionStatus @default(PENDING_PAYMENT)
  productionStage       Int       @default(0)     // 0-100%
  productionNotes       String?

  // Sale tracking
  saleStatus            SaleStatus @default(NOT_STARTED)

  // Final outcome
  finalOutcome          FinalOutcome?
  userEarnings          Float?
  companyEarnings       Float?

  // Product assignment
  productId             String?
  product               Product?  @relation(...)

  // Sales referral
  referralCode          String    @unique @default(uuid())

  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  sales                 Sale[]

  @@index([userId])
  @@index([paymentStatus])
  @@index([productionStatus])
  @@index([saleStatus])
}
```

**Timeline Flow**:
1. `createdAt`: Investment record created
2. `investmentDate`: Payment completed (FINISHED)
3. `productionStartDate`: Production begins (auto-set on payment)
4. `productionEndDate`: Production complete (+6 months)
5. `saleStartDate`: Product ready for sale
6. `saleEndDate`: Sale period ends (+2 months)

---

### Product

Finished products available in shop.

```prisma
model Product {
  id              String    @id @default(uuid())
  name            String
  description     String    @db.Text
  price           Float     @default(550)         // Discounted price
  originalPrice   Float     @default(600)
  images          String[]                        // Array of URLs
  isAvailable     Boolean   @default(true)
  isFeatured      Boolean   @default(false)

  // Specifications
  material        String?
  dimensions      String?
  weight          String?
  craftsman       String?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  investments     Investment[]
  sales           Sale[]

  @@index([isAvailable])
}
```

---

### Sale

Tracks product sales (both investor and direct).

```prisma
model Sale {
  id              String    @id @default(uuid())
  investmentId    String?
  investment      Investment? @relation(...)
  productId       String?
  product         Product?  @relation(...)

  // Buyer information
  buyerEmail      String?
  buyerName       String?
  buyerAddress    String?

  // Payment
  paymentId       String?   @unique
  paymentStatus   PaymentStatus @default(PENDING)
  nowPaymentId    String?   @unique
  amount          Float

  // Referral tracking
  referredByUserId String?
  referredByUser  User?     @relation("ReferralSales", ...)
  referralCode    String?
  saleType        SaleType  @default(DIRECT)

  // Earnings split
  investorEarnings Float?
  companyEarnings  Float?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([investmentId])
  @@index([paymentStatus])
}
```

---

### TrackingEvent

Analytics and attribution tracking.

```prisma
model TrackingEvent {
  id              String    @id @default(uuid())

  // UTM Parameters
  utmSource       String?   // INF_XXXXX (influencer code)
  utmMedium       String?   // instagram, tiktok, youtube, etc.
  utmCampaign     String?
  utmContent      String?
  utmTerm         String?
  referralCode    String?   // Alternative referral tracking

  // Visitor identification
  visitorId       String    // Browser fingerprint
  userId          String?   // If user is logged in
  user            User?     @relation(...)

  // Device information
  ipAddress       String?
  userAgent       String?
  deviceType      String?   // mobile, desktop, tablet
  browser         String?
  browserVersion  String?
  os              String?
  osVersion       String?

  // Event details
  eventType       EventType
  eventData       Json?     // Additional event-specific data
  pageUrl         String?
  pageTitle       String?

  // Session tracking
  sessionId       String
  sessionDuration Int?      // Seconds
  scrollDepth     Int?      // Percentage

  // Geolocation
  country         String?
  city            String?

  createdAt       DateTime  @default(now())

  @@index([utmSource])
  @@index([referralCode])
  @@index([visitorId])
  @@index([sessionId])
  @@index([eventType])
  @@index([createdAt])
}
```

**Key Indexes**:
- `utmSource`: For seller/influencer queries
- `visitorId`: For unique visitor counts
- `eventType`: For funnel analysis

---

### Ticket & TicketReply

Support ticket system.

```prisma
model Ticket {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(...)

  subject         String
  message         String    @db.Text
  status          TicketStatus @default(OPEN)
  priority        TicketPriority @default(MEDIUM)
  category        String?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  replies         TicketReply[]

  @@index([userId])
  @@index([status])
}

model TicketReply {
  id              String    @id @default(uuid())
  ticketId        String
  ticket          Ticket    @relation(...)
  userId          String
  user            User      @relation(...)

  message         String    @db.Text
  isAdminReply    Boolean   @default(false)

  createdAt       DateTime  @default(now())

  @@index([ticketId])
}
```

---

### PaymentLog

NowPayments webhook logs for debugging.

```prisma
model PaymentLog {
  id              String    @id @default(uuid())
  nowPaymentId    String?
  paymentStatus   String
  payType         String?   // 'investment' or 'purchase'
  relatedId       String?   // investmentId or saleId

  ipnData         Json?     // Full IPN payload

  createdAt       DateTime  @default(now())

  @@index([nowPaymentId])
  @@index([relatedId])
}
```

---

### Setting

Key-value store for system settings.

```prisma
model Setting {
  id              String    @id @default(uuid())
  key             String    @unique
  value           String    @db.Text

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

---

## Enums

### Role
```prisma
enum Role {
  USER          // Regular investor
  ADMIN         // Admin panel access
  SUPER_ADMIN   // Full system access
}
```

### PaymentStatus
```prisma
enum PaymentStatus {
  PENDING         // Waiting for payment
  CONFIRMING      // Payment detected, confirming
  CONFIRMED       // Payment confirmed
  SENDING         // Processing
  PARTIALLY_PAID  // Partial payment received
  FINISHED        // Payment complete ✓
  FAILED          // Payment failed
  REFUNDED        // Payment refunded
  EXPIRED         // Payment expired
}
```

**Commission Note**: Only `FINISHED` status counts for influencer commission.

### ProductionStatus
```prisma
enum ProductionStatus {
  PENDING_PAYMENT   // Waiting for payment
  QUEUED            // In production queue
  IN_PRODUCTION     // Being crafted
  QUALITY_CHECK     // Quality inspection
  FRAMING           // Final framing
  COMPLETED         // Ready for sale
}
```

### SaleStatus
```prisma
enum SaleStatus {
  NOT_STARTED          // Production not complete
  ACTIVE               // Available for sale
  SOLD_BY_INVESTOR     // Investor sold it
  SOLD_BY_COMPANY      // Company sold it
  GUARANTEED_DELIVERY  // Guaranteed payment to investor
}
```

### FinalOutcome
```prisma
enum FinalOutcome {
  SOLD_BY_INVESTOR      // Investor earned commission
  SOLD_BY_COMPANY       // Company sold, investor gets base
  GUARANTEED_DELIVERY   // Guaranteed amount paid
}
```

### SaleType
```prisma
enum SaleType {
  REFERRAL    // Sold via referral link
  DIRECT      // Direct sale
}
```

### EventType
```prisma
enum EventType {
  PAGE_VIEW       // Page loaded
  SCROLL          // User scrolled
  CLICK           // Element clicked
  SIGNUP          // User registered
  INVESTMENT      // Investment initiated
  PURCHASE        // Shop purchase
  REFERRAL_CLICK  // Referral link clicked
  SESSION_START   // New session
  SESSION_END     // Session ended
  LOGIN_CLICK     // Login button clicked
  PAYMENT_CLICK   // Payment button clicked
  REGISTER_CLICK  // Register button clicked
}
```

### TicketStatus
```prisma
enum TicketStatus {
  OPEN            // New ticket
  IN_PROGRESS     // Being handled
  WAITING_REPLY   // Waiting for user
  RESOLVED        // Issue resolved
  CLOSED          // Ticket closed
}
```

### TicketPriority
```prisma
enum TicketPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

---

## Common Queries

### Get Seller Stats
```typescript
// Count finished investments for a seller
const finishedInvestments = await prisma.investment.count({
  where: {
    user: { referredBy: referralCode },
    paymentStatus: 'FINISHED',
  },
});
```

### Get User's Investments
```typescript
const investments = await prisma.investment.findMany({
  where: { userId },
  include: { product: true },
  orderBy: { createdAt: 'desc' },
});
```

### Get Tracking Events by Source
```typescript
const events = await prisma.trackingEvent.findMany({
  where: { utmSource: 'INF_ABC123' },
  orderBy: { createdAt: 'desc' },
});
```

### Get Unique Visitors
```typescript
const uniqueVisitors = await prisma.trackingEvent.findMany({
  where: { utmSource: referralCode },
  distinct: ['visitorId'],
  select: { visitorId: true },
});
const count = uniqueVisitors.length;
```

---

## Migrations

### Generate Migration
```bash
cd backend
npx prisma migrate dev --name migration_name
```

### Deploy Migration
```bash
npx prisma migrate deploy
```

### Reset Database (Development)
```bash
npx prisma migrate reset
```

### Generate Prisma Client
```bash
npx prisma generate
```

---

## Database Indexes

Critical indexes for performance:

| Table | Index | Purpose |
|-------|-------|---------|
| User | email | Login lookup |
| User | referralCode | Referral queries |
| Investment | userId | User's investments |
| Investment | paymentStatus | Status filtering |
| TrackingEvent | utmSource | Seller analytics |
| TrackingEvent | visitorId | Unique visitor counting |
| TrackingEvent | eventType | Funnel analysis |
| TrackingEvent | createdAt | Time-based queries |

