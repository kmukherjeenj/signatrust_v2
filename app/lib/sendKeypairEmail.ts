import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import { generateAppleCoupon, generateAndroidCoupon } from './couponGenerator.js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, keypair, platform } = req.body;

  if (!email || !keypair || !platform) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const couponHtml = platform === 'ios' 
      ? await generateAppleCoupon(keypair)
      : await generateAndroidCoupon(keypair);

    await transporter.sendMail({
      from: '"Signatrust" <noreply@signatrust.com>',
      to: email,
      subject: 'Your Signatrust DID Coupon',
      html: couponHtml,
    });

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Error sending email' });
  }
}