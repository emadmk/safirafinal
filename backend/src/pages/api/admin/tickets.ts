import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { page = '1', limit = '20', status, priority, unread } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (priority) {
      where.priority = priority;
    }

    const [tickets, total, unreadCount] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
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
        skip,
        take: limitNum,
      }),
      prisma.ticket.count({ where }),
      // Count unread tickets (no admin reply yet)
      prisma.ticket.count({
        where: {
          status: { in: ['OPEN', 'IN_PROGRESS'] },
          replies: {
            none: {
              isAdminReply: true,
            },
          },
        },
      }),
    ]);

    // Add isUnread flag to each ticket
    const ticketsWithUnread = tickets.map((ticket: any) => ({
      ...ticket,
      isUnread: !ticket.replies.some((reply: any) => reply.isAdminReply),
    }));

    res.json({
      tickets: ticketsWithUnread,
      unreadCount,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAdmin(handler);
