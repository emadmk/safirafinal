# Frontend Pages Documentation

## Route Structure

```
/                     → Landing (public)
/login                → Login (public)
/register             → Register (public)
/shop                 → Shop (public)
/invest               → Invest (public)

/dashboard            → User Dashboard (protected)
├── /investments      → User Investments
├── /investments/:id  → Investment Detail
├── /profile          → User Profile
└── /tickets          → Support Tickets

/admin                → Admin Dashboard (admin only)
├── /investments      → Manage Investments
├── /products         → Manage Products
├── /users            → Manage Users
├── /tickets          → Support Tickets
├── /payments         → Payment Logs
├── /sellers          → Seller/Influencer List
├── /sellers/:code    → Seller Detail
└── /tracking         → Analytics Overview
```

---

## Public Pages

### Landing (`/`)
**File**: `frontend/src/pages/Landing.tsx`

Main marketing page with:
- Hero section with investment CTA
- How it works explanation
- Product showcase
- Trust indicators
- Marketing popup (appears after 5 seconds)

**Key Components**:
- Marketing popup with email capture
- Animated sections using Framer Motion
- Responsive design for mobile/desktop

---

### Login (`/login`)
**File**: `frontend/src/pages/Login.tsx`

User authentication page:
- Email/password form
- Remember me option
- Link to register
- Redirects to dashboard on success

**Form Fields**:
```typescript
{
  email: string;
  password: string;
}
```

---

### Register (`/register`)
**File**: `frontend/src/pages/Register.tsx`

New user registration:
- Multi-step or single form
- Email, password, name fields
- Optional referral code field
- Terms acceptance checkbox

**Form Fields**:
```typescript
{
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  referredBy?: string;  // Referral code
}
```

---

### Shop (`/shop`)
**File**: `frontend/src/pages/Shop.tsx`

Product catalog:
- Grid of available products
- Product cards with images
- Price display (discount visible)
- Add to cart functionality

---

### Invest (`/invest`)
**File**: `frontend/src/pages/Invest.tsx`

Investment landing and registration flow:
- Investment explanation
- Benefits showcase
- Registration form (if not logged in)
- Payment initiation (if logged in)

**Key Features**:
- Tracking initialized on page load (`initTracking()`)
- UTM parameters captured from URL
- SIGNUP event tracked on registration
- INVESTMENT event tracked on payment start

**Tracking Integration**:
```typescript
useEffect(() => {
  initTracking()  // Initialize tracking
}, [])

const handleCreateAccount = async () => {
  // After successful registration
  trackEvent('SIGNUP', { referralCode })
}
```

---

## User Dashboard Pages

### Dashboard (`/dashboard`)
**File**: `frontend/src/pages/Dashboard.tsx`

User overview:
- Investment summary cards
- Recent investments list
- Quick action buttons
- Notifications/alerts

**Stats Displayed**:
- Total invested amount
- Number of investments
- Current production status
- Expected earnings

---

### Investments (`/dashboard/investments`)
**File**: `frontend/src/pages/Investments.tsx`

User's investment list:
- All investments with status
- Filter by status
- Sort by date
- Click to view details

**Investment Card Info**:
- Payment status badge
- Production stage progress
- Expected completion date
- User investment amount

---

### Investment Detail (`/dashboard/investments/:id`)
**File**: `frontend/src/pages/InvestmentDetail.tsx`

Single investment details:
- Full investment timeline
- Production progress visualization
- Payment information
- Referral link for sales

**Sections**:
1. Investment Summary
2. Payment Details
3. Production Timeline
4. Sale Status (when ready)
5. Earnings Breakdown

---

### Profile (`/dashboard/profile`)
**File**: `frontend/src/pages/Profile.tsx`

User profile management:
- Personal information
- Contact details
- Address for shipping
- Password change
- Referral code display

**Editable Fields**:
```typescript
{
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
}
```

---

### Tickets (`/dashboard/tickets`)
**File**: `frontend/src/pages/Tickets.tsx`

Support ticket system:
- List of user's tickets
- Create new ticket
- View ticket thread
- Reply to admin responses

**Ticket Categories**:
- Payment Issues
- Production Updates
- Shipping & Delivery
- Account Issues
- General Questions

---

## Admin Pages

### Admin Dashboard (`/admin`)
**File**: `frontend/src/pages/admin/AdminDashboard.tsx`

Admin overview:
- Key statistics cards
- Recent investments
- Recent users
- Quick actions

**Stats**:
- Total users
- Total investments
- Total revenue
- Pending payments

---

### Admin Investments (`/admin/investments`)
**File**: `frontend/src/pages/admin/AdminInvestments.tsx`

Manage all investments:
- Full investment list
- Filter by status
- Update production stage
- Add production notes
- Change payment status

**Admin Actions**:
- Update production status
- Set production stage (0-100%)
- Add notes
- View payment details

---

### Admin Products (`/admin/products`)
**File**: `frontend/src/pages/admin/AdminProducts.tsx`

Product management:
- Add new products
- Edit product details
- Upload images
- Set availability
- Mark as featured

---

### Admin Users (`/admin/users`)
**File**: `frontend/src/pages/admin/AdminUsers.tsx`

User management:
- All users list
- Search by name/email
- View user details
- See user investments
- Referral information

---

### Admin Tickets (`/admin/tickets`)
**File**: `frontend/src/pages/admin/AdminTickets.tsx`

Support management:
- All tickets list
- Filter by status
- Respond to tickets
- Change ticket status
- Priority management

---

### Admin Payments (`/admin/payments`)
**File**: `frontend/src/pages/admin/AdminPayments.tsx`

Payment logs:
- All payment attempts
- IPN webhook logs
- Status history
- Debug information

---

### Admin Sellers (`/admin/sellers`)
**File**: `frontend/src/pages/admin/AdminSellers.tsx`

Influencer/seller overview:
- All referral codes
- Performance metrics
- Commission tracking
- Payout status

**Stats Per Seller**:
```typescript
interface Seller {
  referralCode: string;
  totalEvents: number;
  pageViews: number;
  uniqueVisitors: number;
  signups: number;
  investmentClicks: number;
  referredUsers: number;
  finishedInvestments: number;
  pendingInvestments: number;
  conversions: number;
  conversionRate: string;
  slotsUsed: number;        // Max 20
  slotsTotal: number;       // Always 20
  commissionEarned: number; // slotsUsed * $40
  pendingCommission: number;
  status: 'ready_payout' | 'active' | 'pending';
  firstActivity: string;
  lastActivity: string;
}
```

**Status Badges**:
- `ready_payout` (green): 20+ conversions, ready for payment
- `active` (blue): 1-19 conversions
- `pending` (gray): No conversions yet

---

### Admin Seller Detail (`/admin/sellers/:code`)
**File**: `frontend/src/pages/admin/AdminSellerDetail.tsx`

Detailed seller view:
- All users from this seller
- User journey tracking
- Investment details per user
- Traffic source breakdown
- Referral links for all platforms

**User Details Shown**:
```typescript
{
  email: string;
  name: string;
  phone: string;
  location: string;
  registeredAt: string;
  firstVisit: string;
  lastActivity: string;
  device: string;
  browser: string;
  source: string;       // UTM medium (instagram, tiktok, etc.)
  status: 'registered' | 'pending_payment' | 'invested';
  totalInvestments: number;
  finishedInvestments: number;
  pendingInvestments: number;
  totalInvested: number;
  commissionEarned: number;
  investments: Investment[];  // Expandable list
}
```

**Referral Links Section**:
```
Instagram: https://safiralux.com/invest?utm_source=INF_XXX&utm_medium=instagram
TikTok: https://safiralux.com/invest?utm_source=INF_XXX&utm_medium=tiktok
YouTube: https://safiralux.com/invest?utm_source=INF_XXX&utm_medium=youtube
Twitter/X: https://safiralux.com/invest?utm_source=INF_XXX&utm_medium=twitter
Facebook: https://safiralux.com/invest?utm_source=INF_XXX&utm_medium=facebook
LinkedIn: https://safiralux.com/invest?utm_source=INF_XXX&utm_medium=linkedin
Blog/Website: https://safiralux.com/invest?utm_source=INF_XXX&utm_medium=blog
Other: https://safiralux.com/invest?utm_source=INF_XXX&utm_medium=other
```

---

### Admin Tracking (`/admin/tracking`)
**File**: `frontend/src/pages/admin/AdminTracking.tsx`

Analytics overview:
- Funnel visualization
- Traffic sources
- Device breakdown
- Event timeline

**Funnel Metrics**:
```typescript
{
  visits: number;
  signups: number;
  investments: number;
  purchases: number;
  signupRate: string;      // (signups/visits) * 100
  investmentRate: string;  // (investments/signups) * 100
}
```

---

## Layout Components

### DashboardLayout
**File**: `frontend/src/components/layouts/DashboardLayout.tsx`

User dashboard wrapper:
- Top navbar with user info
- Sidebar navigation
- Main content area
- Logout functionality

**Menu Items**:
- Dashboard
- Investments
- Profile
- Tickets

---

### AdminLayout
**File**: `frontend/src/components/layouts/AdminLayout.tsx`

Admin panel wrapper:
- Admin-specific navbar
- Extended sidebar
- Admin actions
- Role verification

**Menu Items**:
- Dashboard
- Investments
- Products
- Users
- Tickets
- Payments
- Sellers (Influencers)
- Analytics

---

## State Management

### authStore (Zustand)
**File**: `frontend/src/store/authStore.ts`

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}
```

**Persistence**: Token stored in localStorage

---

## API Integration

### API Client
**File**: `frontend/src/lib/api.ts`

```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

// Automatically attach auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## Tracking Library

### Client-side Tracking
**File**: `frontend/src/lib/tracking.ts`

```typescript
// Initialize tracking on page load
export const initTracking = async () => {
  // Capture UTM params from URL
  // Send PAGE_VIEW event
  // Start session tracking
}

// Track specific events
export const trackEvent = async (
  eventType: string,
  data?: Record<string, any>
) => {
  // Send event to backend
  // Include session ID, visitor ID
}
```

**Usage in Components**:
```typescript
// Page load
useEffect(() => {
  initTracking()
}, [])

// Button click
const handleClick = () => {
  trackEvent('CLICK', { button: 'invest-cta' })
}

// Registration
const handleSignup = () => {
  trackEvent('SIGNUP', { referralCode })
}
```

