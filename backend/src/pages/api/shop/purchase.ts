import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { createInvoice } from '@/lib/nowpayment';
import { trackEvent } from '@/lib/tracking';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const purchaseSchema = z.object({
  productId: z.string(),
  buyerEmail: z.string().email(),
  buyerName: z.string().min(1),
  buyerAddress: z.string().min(1),
  referralCode: z.string().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = purchaseSchema.parse(req.body);

    // Find the product
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product || !product.isAvailable) {
      return res.status(404).json({ error: 'Product not found or not available' });
    }

    // Find associated investment (if any)
    const investment = await prisma.investment.findFirst({
      where: {
        productId: data.productId,
        saleStatus: 'ACTIVE',
      },
    });

    // Determine sale type
    let referredByUserId = null;
    let saleType = 'DIRECT';

    if (data.referralCode) {
      // Check if this is an investor's referral code
      const referringInvestment = await prisma.investment.findFirst({
        where: { referralCode: data.referralCode },
        include: { user: true },
      });

      if (referringInvestment) {
        referredByUserId = referringInvestment.userId;
        saleType = 'REFERRAL';
      }
    }

    const orderId = `SALE-${uuidv4()}`;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const backendUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';

    // Create sale record
    const sale = await prisma.sale.create({
      data: {
        investmentId: investment?.id,
        productId: data.productId,
        buyerEmail: data.buyerEmail,
        buyerName: data.buyerName,
        buyerAddress: data.buyerAddress,
        paymentId: orderId,
        paymentStatus: 'PENDING',
        amount: product.price,
        referredByUserId,
        referralCode: data.referralCode,
        saleType: saleType as any,
      },
    });

    // Create NowPayment invoice
    const invoice = await createInvoice({
      price_amount: product.price,
      price_currency: 'usd',
      order_id: orderId,
      order_description: `Safira Luxury - ${product.name}`,
      ipn_callback_url: `${backendUrl}/api/payments/ipn`,
      success_url: `${frontendUrl}/shop?purchase=success`,
      cancel_url: `${frontendUrl}/shop?purchase=cancelled`,
    });

    // Track purchase event
    await trackEvent({
      req,
      eventType: 'PURCHASE',
      eventData: {
        saleId: sale.id,
        productId: data.productId,
        amount: product.price,
        referralCode: data.referralCode,
      },
    });

    res.json({
      saleId: sale.id,
      invoiceUrl: invoice.invoice_url,
      orderId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Purchase error:', error);
    res.status(500).json({ error: 'Failed to create purchase' });
  }
}
