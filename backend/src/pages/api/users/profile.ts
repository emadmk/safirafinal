import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { authenticateUser, hashPassword } from '@/lib/auth';
import { z } from 'zod';

const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authUser = await authenticateUser(req);
  if (!authUser) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const user = await prisma.user.findUnique({
        where: { id: authUser.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          address: true,
          city: true,
          country: true,
          postalCode: true,
          referralCode: true,
          role: true,
          createdAt: true,
        },
      });

      res.json({ user });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'PATCH') {
    try {
      const data = updateProfileSchema.parse(req.body);

      const updateData: any = {};

      if (data.firstName) updateData.firstName = data.firstName;
      if (data.lastName) updateData.lastName = data.lastName;
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.address !== undefined) updateData.address = data.address;
      if (data.city !== undefined) updateData.city = data.city;
      if (data.country !== undefined) updateData.country = data.country;
      if (data.postalCode !== undefined) updateData.postalCode = data.postalCode;

      // Handle password change
      if (data.newPassword) {
        if (!data.currentPassword) {
          return res.status(400).json({ error: 'Current password is required' });
        }

        const user = await prisma.user.findUnique({
          where: { id: authUser.userId },
        });

        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        const bcrypt = await import('bcryptjs');
        const isValid = await bcrypt.compare(data.currentPassword, user.password);
        if (!isValid) {
          return res.status(400).json({ error: 'Current password is incorrect' });
        }

        updateData.password = await hashPassword(data.newPassword);
      }

      const updated = await prisma.user.update({
        where: { id: authUser.userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          address: true,
          city: true,
          country: true,
          postalCode: true,
          referralCode: true,
          role: true,
        },
      });

      res.json({ user: updated });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
