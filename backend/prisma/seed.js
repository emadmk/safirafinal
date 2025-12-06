const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@safiralux.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Safira',
      role: 'SUPER_ADMIN',
      referralCode: 'ADMIN001',
      isEmailVerified: true,
    },
  });

  console.log('Admin user created:', admin.email);

  // Create some sample settings
  const settings = [
    { key: 'investment_amount', value: '100' },
    { key: 'company_investment', value: '250' },
    { key: 'product_value', value: '600' },
    { key: 'production_days', value: '180' },
    { key: 'sale_days', value: '60' },
    { key: 'referral_earnings', value: '250' },
    { key: 'direct_sale_earnings', value: '200' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log('Settings created');
  console.log('Seeding completed!');
  console.log('');
  console.log('Admin Login:');
  console.log('  Email:', adminEmail);
  console.log('  Password:', adminPassword);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
