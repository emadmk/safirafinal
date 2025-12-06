import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth';
import { z } from 'zod';

const createTicketSchema = z.object({
  subject: z.string().min(1),
  message: z.string().min(1),
  category: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authUser = await authenticateUser(req);
  if (!authUser) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const tickets = await prisma.ticket.findMany({
        where: { userId: authUser.userId },
        include: {
          replies: {
            include: {
              user: {
                select: { firstName: true, lastName: true, role: true },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ tickets });
    } catch (error) {
      console.error('Get tickets error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const data = createTicketSchema.parse(req.body);

      const ticket = await prisma.ticket.create({
        data: {
          userId: authUser.userId,
          subject: data.subject,
          message: data.message,
          category: data.category,
          priority: data.priority || 'MEDIUM',
        },
      });

      res.status(201).json({ ticket });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      console.error('Create ticket error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
