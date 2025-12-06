#!/bin/bash

# Safira Luxury - Deployment Script for Ubuntu 22.04
# Run this script on your server: sudo bash deploy.sh

set -e

echo "=========================================="
echo "  Safira Luxury - Deployment Script"
echo "=========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="safiralux.com"
APP_DIR="/var/www/safira"
NODE_VERSION="20"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root (sudo bash deploy.sh)${NC}"
    exit 1
fi

echo -e "${GREEN}Step 1: Updating system packages...${NC}"
apt update && apt upgrade -y

echo -e "${GREEN}Step 2: Installing required packages...${NC}"
apt install -y curl git nginx certbot python3-certbot-nginx ufw

echo -e "${GREEN}Step 3: Installing Node.js ${NODE_VERSION}...${NC}"
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
apt install -y nodejs

echo -e "${GREEN}Step 4: Installing PM2...${NC}"
npm install -g pm2

echo -e "${GREEN}Step 5: Installing PostgreSQL...${NC}"
apt install -y postgresql postgresql-contrib

# Start PostgreSQL
systemctl start postgresql
systemctl enable postgresql

echo -e "${GREEN}Step 6: Setting up PostgreSQL database...${NC}"
# Generate random password
DB_PASSWORD=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 24)

sudo -u postgres psql -c "CREATE USER safira WITH PASSWORD '${DB_PASSWORD}';" || true
sudo -u postgres psql -c "CREATE DATABASE safira_luxury OWNER safira;" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE safira_luxury TO safira;" || true

echo -e "${GREEN}Step 7: Creating application directory...${NC}"
mkdir -p ${APP_DIR}

echo -e "${GREEN}Step 8: Copying application files...${NC}"
# Copy files (assuming they're in current directory)
cp -r backend ${APP_DIR}/
cp -r frontend ${APP_DIR}/

echo -e "${GREEN}Step 9: Setting up environment variables...${NC}"
cat > ${APP_DIR}/backend/.env << EOF
# Database
DATABASE_URL="postgresql://safira:${DB_PASSWORD}@localhost:5432/safira_luxury"

# NextAuth
NEXTAUTH_URL="https://${DOMAIN}"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# JWT
JWT_SECRET="$(openssl rand -base64 32)"

# NowPayment - REPLACE WITH YOUR KEYS
NOWPAYMENT_API_KEY="your-nowpayment-api-key"
NOWPAYMENT_IPN_SECRET="your-nowpayment-ipn-secret"
NOWPAYMENT_API_URL="https://api.nowpayments.io/v1"

# Email (Gmail SMTP) - REPLACE WITH YOUR CREDENTIALS
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="Safira Luxury <noreply@safiralux.com>"

# Frontend URL
FRONTEND_URL="https://${DOMAIN}"

# Microinfluencer Platform API
MICROINFLUENCER_API_URL="https://arsalan.safiralux.com/api"
MICROINFLUENCER_API_KEY="$(openssl rand -base64 24)"

# Admin credentials
ADMIN_EMAIL="admin@safiralux.com"
ADMIN_PASSWORD="$(openssl rand -base64 16)"
EOF

echo -e "${GREEN}Step 10: Installing backend dependencies...${NC}"
cd ${APP_DIR}/backend
npm install

echo -e "${GREEN}Step 11: Setting up database schema...${NC}"
npx prisma generate
npx prisma db push
npm run db:seed || true

echo -e "${GREEN}Step 12: Building backend...${NC}"
npm run build

echo -e "${GREEN}Step 13: Installing frontend dependencies...${NC}"
cd ${APP_DIR}/frontend

# Create frontend env
cat > .env << EOF
VITE_API_URL=https://${DOMAIN}/api
EOF

npm install

echo -e "${GREEN}Step 14: Building frontend...${NC}"
npm run build

echo -e "${GREEN}Step 15: Setting up Nginx...${NC}"
cat > /etc/nginx/sites-available/safira << EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    # Frontend (Vite build)
    location / {
        root ${APP_DIR}/frontend/dist;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Uploads
    location /uploads {
        alias ${APP_DIR}/backend/public/uploads;
    }
}
EOF

ln -sf /etc/nginx/sites-available/safira /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl restart nginx

echo -e "${GREEN}Step 16: Setting up PM2...${NC}"
cd ${APP_DIR}/backend

cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'safira-backend',
    script: 'npm',
    args: 'start',
    cwd: '${APP_DIR}/backend',
    env: {
      NODE_ENV: 'production',
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
  }]
};
EOF

pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo -e "${GREEN}Step 17: Setting up firewall...${NC}"
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

echo -e "${GREEN}Step 18: Setting up SSL with Let's Encrypt...${NC}"
certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos --email admin@${DOMAIN} || echo -e "${YELLOW}SSL setup skipped. Run manually: certbot --nginx -d ${DOMAIN}${NC}"

echo ""
echo "=========================================="
echo -e "${GREEN}  Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "Important Information:"
echo "----------------------"
echo -e "Database Password: ${YELLOW}${DB_PASSWORD}${NC}"
echo ""
echo "Please update the following in ${APP_DIR}/backend/.env:"
echo "  - NOWPAYMENT_API_KEY"
echo "  - NOWPAYMENT_IPN_SECRET"
echo "  - SMTP_USER and SMTP_PASS"
echo ""
echo "After updating .env, restart the backend:"
echo "  pm2 restart safira-backend"
echo ""
echo "Admin login credentials are in .env file"
echo ""
echo "Your site is now available at: https://${DOMAIN}"
echo "=========================================="
