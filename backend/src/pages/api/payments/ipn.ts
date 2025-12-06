import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { verifyIPNSignature, mapPaymentStatus } from '@/lib/nowpayment';
import { sendEmail, emailTemplates } from '@/lib/email';
import { sendConversionToMicroinfluencer } from '@/lib/tracking';

type PaymentStatus =
  | 'PENDING'
  | 'CONFIRMING'
  | 'CONFIRMED'
  | 'SENDING'
  | 'PARTIALLY_PAID'
  | 'FINISHED'
  | 'FAILED'
  | 'REFUNDED'
  | 'EXPIRED';

type ProductionStatus =
  | 'PENDING_PAYMENT'
  | 'QUEUED'
  | 'IN_PRODUCTION'
  | 'QUALITY_CHECK'
  | 'FRAMING'
  | 'COMPLETED';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const ipnData = req.body;
    const signature = req.headers['x-nowpayments-sig'] as string;

    // Verify signature
    if (!verifyIPNSignature(ipnData, signature)) {
      console.error('Invalid IPN signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Log the payment event
    await prisma.paymentLog.create({
      data: {
        nowPaymentId: ipnData.payment_id?.toString(),
        paymentStatus: ipnData.payment_status,
        payType: ipnData.order_id?.startsWith('INV-') ? 'investment' : 'purchase',
        relatedId: ipnData.order_id,
        ipnData: ipnData,
      },
    });

    const orderId = ipnData.order_id;
    const paymentStatus = mapPaymentStatus(ipnData.payment_status) as PaymentStatus;

    // Check if this is an investment or a shop purchase
    if (orderId?.startsWith('INV-')) {
      // Handle investment payment
      const investment = await prisma.investment.findFirst({
        where: { paymentId: orderId },
        include: { user: true },
      });

      if (investment) {
        const updateData: any = {
          paymentStatus,
          paymentMethod: ipnData.pay_currency,
          paymentCurrency: ipnData.pay_currency,
          paymentAmount: ipnData.pay_amount,
          paymentAddress: ipnData.pay_address,
        };

        // If payment is finished, start production
        if (paymentStatus === 'FINISHED') {
          const now = new Date();
          const productionEndDate = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000); // +6 months

          updateData.investmentDate = now;
          updateData.productionStartDate = now;
          updateData.productionEndDate = productionEndDate;
          updateData.saleStartDate = productionEndDate;
          updateData.saleEndDate = new Date(productionEndDate.getTime() + 60 * 24 * 60 * 60 * 1000); // +2 months after production
          updateData.productionStatus = 'QUEUED' as ProductionStatus;

          // Send confirmation email
          try {
            const template = emailTemplates.paymentConfirmed(
              investment.user.firstName,
              investment.userInvestment
            );
            await sendEmail({
              to: investment.user.email,
              subject: template.subject,
              html: template.html,
            });
          } catch (emailError) {
            console.error('Failed to send payment confirmation email:', emailError);
          }

          // Send conversion to microinfluencer platform
          // Check if user came from an influencer
          const trackingEvent = await prisma.trackingEvent.findFirst({
            where: {
              userId: investment.userId,
              utmSource: { not: null },
            },
            orderBy: { createdAt: 'desc' },
          });

          if (trackingEvent?.utmSource) {
            await sendConversionToMicroinfluencer({
              conversionType: 'INVESTMENT',
              conversionId: investment.id,
              referralCode: trackingEvent.utmSource,
              customerId: investment.userId,
              customerEmail: investment.user.email,
              amount: investment.userInvestment,
              commission: 40, // $40 per conversion
            });
          }
        }

        await prisma.investment.update({
          where: { id: investment.id },
          data: updateData,
        });
      }
    } else if (orderId?.startsWith('SALE-')) {
      // Handle shop purchase
      const sale = await prisma.sale.findFirst({
        where: { paymentId: orderId },
        include: {
          investment: {
            include: { user: true },
          },
        },
      });

      if (sale && paymentStatus === 'FINISHED') {
        await prisma.sale.update({
          where: { id: sale.id },
          data: { paymentStatus },
        });

        // Update investment sale status
        if (sale.investment) {
          const saleType = sale.saleType;
          const investorEarnings = saleType === 'REFERRAL' ? 250 : 200;
          const companyEarnings = saleType === 'REFERRAL' ? 300 : 350;

          await prisma.investment.update({
            where: { id: sale.investmentId! },
            data: {
              saleStatus: saleType === 'REFERRAL' ? 'SOLD_BY_INVESTOR' : 'SOLD_BY_COMPANY',
              finalOutcome: saleType === 'REFERRAL' ? 'SOLD_BY_INVESTOR' : 'SOLD_BY_COMPANY',
              userEarnings: investorEarnings,
              companyEarnings,
            },
          });

          await prisma.sale.update({
            where: { id: sale.id },
            data: {
              investorEarnings,
              companyEarnings,
            },
          });

          // Send sale completion email to investor
          try {
            const template = emailTemplates.saleComplete(
              sale.investment.user.firstName,
              investorEarnings,
              saleType
            );
            await sendEmail({
              to: sale.investment.user.email,
              subject: template.subject,
              html: template.html,
            });
          } catch (emailError) {
            console.error('Failed to send sale completion email:', emailError);
          }

          // Send purchase conversion to microinfluencer platform
          if (sale.referralCode) {
            await sendConversionToMicroinfluencer({
              conversionType: 'PURCHASE',
              conversionId: sale.id,
              referralCode: sale.referralCode,
              customerId: sale.buyerEmail || 'anonymous',
              customerEmail: sale.buyerEmail || undefined,
              amount: sale.amount,
              commission: 40, // $40 per conversion
            });
          }
        }
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('IPN processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
