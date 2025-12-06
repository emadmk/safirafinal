import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const users = await prisma.user.findMany({
      where: { role: 'USER' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        city: true,
        country: true,
        referralCode: true,
        createdAt: true,
        _count: {
          select: { investments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Create CSV
    const headers = [
      'ID',
      'Email',
      'First Name',
      'Last Name',
      'Phone',
      'Address',
      'City',
      'Country',
      'Referral Code',
      'Investments',
      'Registered At',
    ];

    const rows = users.map((user) => [
      user.id,
      user.email,
      user.firstName || '',
      user.lastName || '',
      user.phone || '',
      user.address || '',
      user.city || '',
      user.country || '',
      user.referralCode,
      user._count.investments,
      new Date(user.createdAt).toISOString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=users-${new Date().toISOString().split('T')[0]}.csv`
    );
    res.send(csvContent);
  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAdmin(handler);
