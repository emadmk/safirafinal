import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'Safira Luxury <noreply@safiralux.com>',
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
};

// Email templates
export const emailTemplates = {
  welcome: (name: string) => ({
    subject: 'Welcome to Safira Luxury Investment',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Georgia', serif; background-color: #0a1628; color: #d4af37; padding: 40px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #0f1d32; border-radius: 10px; padding: 40px; border: 1px solid #d4af37; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: bold; color: #d4af37; }
          .content { color: #e8e8e8; line-height: 1.8; }
          .button { display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #f4e5b0 50%, #d4af37 100%); color: #0a1628; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #888; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">SAFIRA LUXURY</div>
          </div>
          <div class="content">
            <h2>Welcome, ${name}!</h2>
            <p>Thank you for joining Safira Luxury Investment Platform. You are now part of an exclusive community of investors in authentic Persian Pateh art.</p>
            <p>Your journey to owning a piece of timeless craftsmanship begins here.</p>
            <center><a href="${process.env.FRONTEND_URL}/dashboard" class="button">Go to Dashboard</a></center>
          </div>
          <div class="footer">
            <p>&copy; 2024 Safira Luxury. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  paymentConfirmed: (name: string, amount: number) => ({
    subject: 'Payment Confirmed - Your Investment Has Started',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Georgia', serif; background-color: #0a1628; color: #d4af37; padding: 40px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #0f1d32; border-radius: 10px; padding: 40px; border: 1px solid #d4af37; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: bold; color: #d4af37; }
          .content { color: #e8e8e8; line-height: 1.8; }
          .highlight { background-color: rgba(212, 175, 55, 0.1); padding: 20px; border-radius: 5px; margin: 20px 0; }
          .amount { font-size: 36px; color: #d4af37; font-weight: bold; }
          .button { display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #f4e5b0 50%, #d4af37 100%); color: #0a1628; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #888; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">SAFIRA LUXURY</div>
          </div>
          <div class="content">
            <h2>Payment Confirmed!</h2>
            <p>Dear ${name},</p>
            <p>Your payment has been successfully processed and your investment journey has officially begun!</p>
            <div class="highlight">
              <p>Your Investment: <span class="amount">$${amount}</span></p>
              <p>Safira's Contribution: <strong>$250</strong></p>
              <p>Product Value: <strong>$600</strong></p>
            </div>
            <p><strong>What happens next?</strong></p>
            <ul>
              <li>Your Pateh artwork production begins immediately</li>
              <li>Production time: 6 months by master craftsmen</li>
              <li>You can track progress in your dashboard</li>
            </ul>
            <center><a href="${process.env.FRONTEND_URL}/dashboard" class="button">Track Your Investment</a></center>
          </div>
          <div class="footer">
            <p>&copy; 2024 Safira Luxury. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  productionComplete: (name: string) => ({
    subject: 'Your Pateh Artwork is Ready!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Georgia', serif; background-color: #0a1628; color: #d4af37; padding: 40px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #0f1d32; border-radius: 10px; padding: 40px; border: 1px solid #d4af37; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: bold; color: #d4af37; }
          .content { color: #e8e8e8; line-height: 1.8; }
          .button { display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #f4e5b0 50%, #d4af37 100%); color: #0a1628; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #888; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">SAFIRA LUXURY</div>
          </div>
          <div class="content">
            <h2>Congratulations, ${name}!</h2>
            <p>Your exquisite Pateh artwork has been completed by our master craftsmen in Kerman.</p>
            <p><strong>The 2-month sale period has now begun!</strong></p>
            <p>Share your referral link to earn <strong>$250</strong> when your artwork sells through your network. If we sell it directly, you'll earn <strong>$200</strong>.</p>
            <p>Remember: If it doesn't sell within 2 months, we guarantee to ship this $600 masterpiece to you at no extra cost!</p>
            <center><a href="${process.env.FRONTEND_URL}/dashboard" class="button">View Your Artwork</a></center>
          </div>
          <div class="footer">
            <p>&copy; 2024 Safira Luxury. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  saleComplete: (name: string, earnings: number, saleType: string) => ({
    subject: 'Your Artwork Has Been Sold!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Georgia', serif; background-color: #0a1628; color: #d4af37; padding: 40px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #0f1d32; border-radius: 10px; padding: 40px; border: 1px solid #d4af37; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: bold; color: #d4af37; }
          .content { color: #e8e8e8; line-height: 1.8; }
          .earnings { font-size: 48px; color: #d4af37; font-weight: bold; text-align: center; margin: 30px 0; }
          .button { display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #f4e5b0 50%, #d4af37 100%); color: #0a1628; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #888; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">SAFIRA LUXURY</div>
          </div>
          <div class="content">
            <h2>Congratulations, ${name}!</h2>
            <p>Great news! Your Pateh artwork has been sold ${saleType === 'REFERRAL' ? 'through your referral link' : 'by Safira'}!</p>
            <p class="earnings">+$${earnings}</p>
            <p>Your earnings have been processed and will be transferred to your account.</p>
            <p>Thank you for being part of the Safira Luxury family. Ready to invest again?</p>
            <center><a href="${process.env.FRONTEND_URL}/dashboard" class="button">Start New Investment</a></center>
          </div>
          <div class="footer">
            <p>&copy; 2024 Safira Luxury. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  ticketReply: (name: string, ticketSubject: string) => ({
    subject: `Reply to your ticket: ${ticketSubject}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Georgia', serif; background-color: #0a1628; color: #d4af37; padding: 40px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #0f1d32; border-radius: 10px; padding: 40px; border: 1px solid #d4af37; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: bold; color: #d4af37; }
          .content { color: #e8e8e8; line-height: 1.8; }
          .button { display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #f4e5b0 50%, #d4af37 100%); color: #0a1628; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #888; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">SAFIRA LUXURY</div>
          </div>
          <div class="content">
            <h2>New Reply to Your Ticket</h2>
            <p>Dear ${name},</p>
            <p>We have replied to your support ticket: <strong>${ticketSubject}</strong></p>
            <center><a href="${process.env.FRONTEND_URL}/dashboard/tickets" class="button">View Reply</a></center>
          </div>
          <div class="footer">
            <p>&copy; 2024 Safira Luxury. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};

export default { sendEmail, emailTemplates };
