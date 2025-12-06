import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { sendEmail, emailTemplates } from '@/lib/email';
import { z } from 'zod';

const updateSchema = z.object({
  productionStatus: z.enum(['PENDING_PAYMENT', 'QUEUED', 'IN_PRODUCTION', 'QUALITY_CHECK', 'FRAMING', 'COMPLETED']).optional(),
  productionStage: z.number().min(0).max(100).optional(),
  productionNotes: z.string().optional(),
  saleStatus: z.enum(['NOT_STARTED', 'ACTIVE', 'SOLD_BY_INVESTOR', 'SOLD_BY_COMPANY', 'GUARANTEED_DELIVERY']).optional(),
  productId: z.string().optional(),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const investment = await prisma.investment.findUnique({
        where: { id: id as string },
        include: {
          user: true,
          product: true,
          sales: {
            include: {
              referredByUser: {
                select: { firstName: true, lastName: true, email: true },
              },
            },
          },
        },
      });

      if (!investment) {
        return res.status(404).json({ error: 'Investment not found' });
      }

      res.json({ investment });
    } catch (error) {
      console.error('Get investment error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'PATCH') {
    try {
      const data = updateSchema.parse(req.body);

      const investment = await prisma.investment.findUnique({
        where: { id: id as string },
        include: { user: true },
      });

      if (!investment) {
        return res.status(404).json({ error: 'Investment not found' });
      }

      const updateData: any = { ...data };

      // If production is completed, set up sale period
      if (data.productionStatus === 'COMPLETED' && investment.productionStatus !== 'COMPLETED') {
        const now = new Date();
        updateData.saleStartDate = now;
        updateData.saleEndDate = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000); // +2 months
        updateData.saleStatus = 'ACTIVE';

        // Send email notification
        try {
          const template = emailTemplates.productionComplete(investment.user.firstName);
          await sendEmail({
            to: investment.user.email,
            subject: template.subject,
            html: template.html,
          });
        } catch (emailError) {
          console.error('Failed to send production complete email:', emailError);
        }
      }

      // If sale status changed to sold or guaranteed
      if (data.saleStatus && ['SOLD_BY_INVESTOR', 'SOLD_BY_COMPANY', 'GUARANTEED_DELIVERY'].includes(data.saleStatus)) {
        if (data.saleStatus === 'SOLD_BY_INVESTOR') {
          updateData.finalOutcome = 'SOLD_BY_INVESTOR';
          updateData.userEarnings = 250;
          updateData.companyEarnings = 300;
        } else if (data.saleStatus === 'SOLD_BY_COMPANY') {
          updateData.finalOutcome = 'SOLD_BY_COMPANY';
          updateData.userEarnings = 200;
          updateData.companyEarnings = 350;
        } else if (data.saleStatus === 'GUARANTEED_DELIVERY') {
          updateData.finalOutcome = 'GUARANTEED_DELIVERY';
          updateData.userEarnings = 600; // They get the product worth $600
          updateData.companyEarnings = 0;
        }
      }

      const updated = await prisma.investment.update({
        where: { id: id as string },
        data: updateData,
        include: {
          user: true,
          product: true,
        },
      });

      res.json({ investment: updated });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      console.error('Update investment error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default requireAdmin(handler);
