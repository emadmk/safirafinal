import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth';
import { createInvoice } from '@/lib/nowpayment';
import { trackEvent } from '@/lib/tracking';
import { v4 as uuidv4 } from 'uuid';

const INVESTMENT_AMOUNT = 100; // $100 USD

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authUser = await authenticateUser(req);
    if (!authUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const orderId = `INV-${uuidv4()}`;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const backendUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';

    // Create investment record
    const investment = await prisma.investment.create({
      data: {
        userId: authUser.userId,
        paymentId: orderId,
        userInvestment: INVESTMENT_AMOUNT,
        companyInvestment: 250,
        productValue: 600,
        paymentStatus: 'PENDING',
      },
    });

    // Create NowPayment invoice
    const invoice = await createInvoice({
      price_amount: INVESTMENT_AMOUNT,
      price_currency: 'usd',
      order_id: orderId,
      order_description: 'Safira Luxury Investment - Handcrafted Pateh Artwork',
      ipn_callback_url: `${backendUrl}/api/payments/ipn`,
      success_url: `${frontendUrl}/dashboard?payment=success&investment=${investment.id}`,
      cancel_url: `${frontendUrl}/invest?payment=cancelled`,
    });

    // Update investment with NowPayment ID
    await prisma.investment.update({
      where: { id: investment.id },
      data: { nowPaymentId: invoice.id },
    });

    // Track investment event
    await trackEvent({
      req,
      eventType: 'INVESTMENT',
      userId: authUser.userId,
      eventData: { investmentId: investment.id, amount: INVESTMENT_AMOUNT },
    });

    res.json({
      investmentId: investment.id,
      invoiceUrl: invoice.invoice_url,
      orderId,
    });
  } catch (error) {
    console.error('Create investment error:', error);
    res.status(500).json({ error: 'Failed to create investment' });
  }
}
