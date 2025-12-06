# Safira Luxury - Investment Platform

A complete luxury e-commerce and investment platform for Persian Pateh art.

## Architecture

- **Backend**: Next.js API (Port 3001)
- **Frontend**: Vite + React + TypeScript (Port 5173)
- **Database**: PostgreSQL
- **Payments**: NowPayment (Crypto)
- **Process Manager**: PM2

## Features

### Landing Page
- Beautiful mobile-first design
- Dark blue (#0a1628) + Gold (#d4af37) theme
- Investment CTA sections
- Product showcase
- How it works guide

### User Dashboard
- Investment tracking with timelines
- Production progress (6 months)
- Sale period tracking (2 months)
- Referral links for earning $250 per sale
- Ticket support system
- Profile management

### Admin Dashboard
- Investment management
- Product management for shop
- User management
- Payment logs (NowPayment IPN)
- Analytics and tracking
- Ticket management

### API Endpoints
- `/api/auth/*` - Authentication
- `/api/investments/*` - Investment management
- `/api/products/*` - Product CRUD
- `/api/shop/*` - Shop purchases
- `/api/tickets/*` - Support tickets
- `/api/tracking/*` - Analytics API for microinfluencers
- `/api/payments/ipn` - NowPayment webhooks
- `/api/admin/*` - Admin endpoints

## Quick Start (Development)

### 1. Clone and Setup

```bash
cd safirafinal
```

### 2. Setup Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

## Deployment (Ubuntu 22.04)

### Option 1: Automatic Deployment

1. Transfer files to your server:
```bash
scp -r safirafinal root@141.11.1.85:/root/
```

2. SSH into server and run:
```bash
ssh root@141.11.1.85
cd /root/safirafinal
chmod +x deploy.sh
sudo bash deploy.sh
```

### Option 2: Manual Deployment

#### Step 1: Install Dependencies
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx certbot python3-certbot-nginx postgresql postgresql-contrib

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PM2
sudo npm install -g pm2
```

#### Step 2: Setup PostgreSQL
```bash
sudo -u postgres psql
CREATE USER safira WITH PASSWORD 'your-password';
CREATE DATABASE safira_luxury OWNER safira;
GRANT ALL PRIVILEGES ON DATABASE safira_luxury TO safira;
\q
```

#### Step 3: Setup Application
```bash
sudo mkdir -p /var/www/safira
sudo cp -r backend frontend /var/www/safira/

# Backend
cd /var/www/safira/backend
cp .env.example .env
# Edit .env with production values
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run build

# Frontend
cd /var/www/safira/frontend
echo "VITE_API_URL=https://safiralux.com/api" > .env
npm install
npm run build
```

#### Step 4: Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/safira
```

```nginx
server {
    listen 80;
    server_name safiralux.com www.safiralux.com;

    location / {
        root /var/www/safira/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        alias /var/www/safira/backend/public/uploads;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/safira /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 5: Start with PM2
```bash
cd /var/www/safira/backend
pm2 start npm --name "safira-backend" -- start
pm2 save
pm2 startup
```

#### Step 6: SSL Certificate
```bash
sudo certbot --nginx -d safiralux.com -d www.safiralux.com
```

## Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/safira_luxury"

# Auth
NEXTAUTH_URL="https://safiralux.com"
NEXTAUTH_SECRET="your-secret"
JWT_SECRET="your-jwt-secret"

# NowPayment
NOWPAYMENT_API_KEY="your-api-key"
NOWPAYMENT_IPN_SECRET="your-ipn-secret"
NOWPAYMENT_API_URL="https://api.nowpayments.io/v1"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="Safira Luxury <noreply@safiralux.com>"

# URLs
FRONTEND_URL="https://safiralux.com"

# Microinfluencer API
MICROINFLUENCER_API_URL="https://arsalan.safiralux.com/api"
MICROINFLUENCER_API_KEY="your-api-key"

# Admin
ADMIN_EMAIL="admin@safiralux.com"
ADMIN_PASSWORD="your-admin-password"
```

## NowPayment Setup

1. Create account at nowpayments.io
2. Get API Key from dashboard
3. Set IPN URL to: `https://safiralux.com/api/payments/ipn`
4. Get IPN Secret from settings
5. Update .env with keys

## Microinfluencer Platform Integration

The tracking API is available at `/api/tracking/analytics` for the microinfluencer platform.

**Authentication**: Use `X-API-Key` header with `MICROINFLUENCER_API_KEY`

**Endpoints**:
- `GET /api/tracking/analytics?referral_code=XXX` - Get analytics for a referral code

## Business Logic

### Investment Flow
1. User invests $100
2. Safira adds $250 (total $350 production budget)
3. 6 months production time
4. 2 months sale period at $550 ($50 discount)
5. Outcomes:
   - Sold via investor referral: Investor gets $250, Safira gets $300
   - Sold by Safira: Investor gets $200, Safira gets $350
   - Not sold: $600 artwork shipped to investor free

### Referral System
- Investor referral: Earn $250 when sold through your link
- 4 successful referral sales = 1 free artwork

## PM2 Commands

```bash
pm2 status                    # Check status
pm2 logs safira-backend       # View logs
pm2 restart safira-backend    # Restart
pm2 stop safira-backend       # Stop
```

## Support

For issues, create a ticket in the admin dashboard or contact support@safiralux.com
