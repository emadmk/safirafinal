import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { hashPassword, generateToken, generateReferralCode } from '@/lib/auth';
import { sendEmail, emailTemplates } from '@/lib/email';
import { trackEvent } from '@/lib/tracking';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  referredBy: z.string().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Generate unique referral code
    let referralCode = generateReferralCode();
    let isUnique = false;
    while (!isUnique) {
      const existing = await prisma.user.findUnique({
        where: { referralCode },
      });
      if (!existing) {
        isUnique = true;
      } else {
        referralCode = generateReferralCode();
      }
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        address: data.address,
        city: data.city,
        country: data.country,
        postalCode: data.postalCode,
        referralCode,
        referredBy: data.referredBy,
      },
    });

    // Track signup event
    await trackEvent({
      req,
      eventType: 'SIGNUP',
      userId: user.id,
      eventData: { referredBy: data.referredBy },
    });

    // Send welcome email
    try {
      const template = emailTemplates.welcome(user.firstName);
      await sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    // Generate JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        referralCode: user.referralCode,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
