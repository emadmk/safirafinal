import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth';
import { sendEmail, emailTemplates } from '@/lib/email';
import { z } from 'zod';

const replySchema = z.object({
  message: z.string().min(1),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authUser = await authenticateUser(req);
    if (!authUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.query;
    const data = replySchema.parse(req.body);

    // Find the ticket
    const ticket = await prisma.ticket.findUnique({
      where: { id: id as string },
      include: { user: true },
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check permissions (user can only reply to their own tickets, admins can reply to any)
    const isAdmin = authUser.role === 'ADMIN' || authUser.role === 'SUPER_ADMIN';
    if (ticket.userId !== authUser.userId && !isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Create reply
    const reply = await prisma.ticketReply.create({
      data: {
        ticketId: ticket.id,
        userId: authUser.userId,
        message: data.message,
        isAdminReply: isAdmin,
      },
      include: {
        user: {
          select: { firstName: true, lastName: true, role: true },
        },
      },
    });

    // Update ticket status
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: isAdmin ? 'WAITING_REPLY' : 'IN_PROGRESS',
      },
    });

    // Send email notification if admin replied
    if (isAdmin) {
      try {
        const template = emailTemplates.ticketReply(ticket.user.firstName, ticket.subject);
        await sendEmail({
          to: ticket.user.email,
          subject: template.subject,
          html: template.html,
        });
      } catch (emailError) {
        console.error('Failed to send ticket reply email:', emailError);
      }
    }

    res.status(201).json({ reply });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Reply error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
