import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth?: {
    user: string;
    pass: string;
  };
}

interface SigningInviteParams {
  to: string;
  documentName: string;
  signingUrl: string;
  creatorName?: string;
}

interface SigningCompleteParams {
  to: string;
  documentName: string;
}

/**
 * Email Service for sending signing notifications
 */
export class EmailService {
  private transporter: Transporter;
  private fromAddress: string;
  private enabled: boolean;

  constructor() {
    // Check if email is configured
    this.enabled = Boolean(process.env.EMAIL_HOST);

    if (!this.enabled) {
      console.log('Email service disabled - EMAIL_HOST not configured');
      // Create a stub transporter for development
      this.transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
      this.fromAddress = 'SignaTrust <noreply@signatrust.io>';
      return;
    }

    const config: EmailConfig = {
      host: process.env.EMAIL_HOST!,
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: process.env.EMAIL_SECURE === 'true',
    };

    // Add auth if credentials provided
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      config.auth = {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      };
    }

    this.transporter = nodemailer.createTransport(config);
    this.fromAddress = process.env.EMAIL_FROM || 'SignaTrust <noreply@signatrust.io>';
  }

  /**
   * Send signing invitation email
   */
  async sendSigningInvite(params: SigningInviteParams): Promise<boolean> {
    const { to, documentName, signingUrl, creatorName } = params;

    const subject = `You've been invited to sign: ${documentName}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">SignaTrust</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">Secure Document Signing</p>
            </div>
            <div style="padding: 32px;">
              <h2 style="color: #18181b; margin: 0 0 16px; font-size: 20px;">You've been invited to sign a document</h2>
              <p style="color: #52525b; line-height: 1.6; margin: 0 0 24px;">
                ${creatorName ? `<strong>${creatorName}</strong> has` : 'You have been'} requested to sign the following document:
              </p>
              <div style="background: #f4f4f5; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <p style="color: #18181b; margin: 0; font-weight: 500;">${documentName}</p>
              </div>
              <a href="${signingUrl}" style="display: block; background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); color: white; text-decoration: none; padding: 14px 24px; border-radius: 8px; text-align: center; font-weight: 500; margin-bottom: 24px;">
                Review & Sign Document
              </a>
              <p style="color: #71717a; font-size: 13px; line-height: 1.5; margin: 0;">
                This link will expire in 7 days. If you didn't expect this email, you can safely ignore it.
              </p>
            </div>
            <div style="background: #fafafa; padding: 20px 32px; border-top: 1px solid #e4e4e7;">
              <p style="color: #a1a1aa; font-size: 12px; margin: 0; text-align: center;">
                Secured with blockchain verification on Solana
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
You've been invited to sign a document

${creatorName ? `${creatorName} has` : 'You have been'} requested to sign: ${documentName}

Click here to review and sign: ${signingUrl}

This link will expire in 7 days.

---
SignaTrust - Secure Document Signing
    `.trim();

    try {
      const result = await this.transporter.sendMail({
        from: this.fromAddress,
        to,
        subject,
        text,
        html,
      });

      if (!this.enabled) {
        console.log('Email (dev mode):', JSON.parse(result.message));
        return true;
      }

      console.log(`Signing invite email sent to ${to} for "${documentName}"`);
      return true;
    } catch (error) {
      console.error('Failed to send signing invite email:', error);
      return false;
    }
  }

  /**
   * Send signing complete notification
   */
  async sendSigningComplete(params: SigningCompleteParams): Promise<boolean> {
    const { to, documentName } = params;

    const subject = `Document signed: ${documentName}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">SignaTrust</h1>
            </div>
            <div style="padding: 32px; text-align: center;">
              <div style="display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); border-radius: 50%; margin-bottom: 20px;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <h2 style="color: #18181b; margin: 0 0 16px; font-size: 20px;">Document Fully Signed!</h2>
              <p style="color: #52525b; line-height: 1.6; margin: 0 0 24px;">
                All parties have signed <strong>${documentName}</strong>. The document has been recorded on the blockchain.
              </p>
              <div style="background: #f4f4f5; border-radius: 8px; padding: 16px; display: inline-flex; align-items: center; gap: 8px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <span style="color: #52525b; font-size: 14px;">Secured on Solana blockchain</span>
              </div>
            </div>
            <div style="background: #fafafa; padding: 20px 32px; border-top: 1px solid #e4e4e7;">
              <p style="color: #a1a1aa; font-size: 12px; margin: 0; text-align: center;">
                SignaTrust - Secure Document Signing
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Document Fully Signed!

All parties have signed "${documentName}". The document has been recorded on the blockchain.

---
SignaTrust - Secure Document Signing
    `.trim();

    try {
      const result = await this.transporter.sendMail({
        from: this.fromAddress,
        to,
        subject,
        text,
        html,
      });

      if (!this.enabled) {
        console.log('Email (dev mode):', JSON.parse(result.message));
        return true;
      }

      console.log(`Signing complete email sent to ${to} for "${documentName}"`);
      return true;
    } catch (error) {
      console.error('Failed to send signing complete email:', error);
      return false;
    }
  }

  /**
   * Send session cancelled notification
   */
  async sendSessionCancelled(params: { to: string; documentName: string }): Promise<boolean> {
    const { to, documentName } = params;

    const subject = `Signing cancelled: ${documentName}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); padding: 32px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">SignaTrust</h1>
            </div>
            <div style="padding: 32px; text-align: center;">
              <div style="display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; background: #fef2f2; border-radius: 50%; margin-bottom: 20px;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              </div>
              <h2 style="color: #18181b; margin: 0 0 16px; font-size: 20px;">Signing Request Cancelled</h2>
              <p style="color: #52525b; line-height: 1.6; margin: 0 0 24px;">
                The signing request for <strong>${documentName}</strong> has been cancelled by the document creator.
              </p>
              <p style="color: #71717a; font-size: 14px; margin: 0;">
                No action is required on your part.
              </p>
            </div>
            <div style="background: #fafafa; padding: 20px 32px; border-top: 1px solid #e4e4e7;">
              <p style="color: #a1a1aa; font-size: 12px; margin: 0; text-align: center;">
                SignaTrust - Secure Document Signing
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Signing Request Cancelled

The signing request for "${documentName}" has been cancelled by the document creator.

No action is required on your part.

---
SignaTrust - Secure Document Signing
    `.trim();

    try {
      const result = await this.transporter.sendMail({
        from: this.fromAddress,
        to,
        subject,
        text,
        html,
      });

      if (!this.enabled) {
        console.log('Email (dev mode):', JSON.parse(result.message));
        return true;
      }

      console.log(`Cancellation email sent to ${to} for "${documentName}"`);
      return true;
    } catch (error) {
      console.error('Failed to send cancellation email:', error);
      return false;
    }
  }

  /**
   * Verify email configuration
   */
  async verify(): Promise<boolean> {
    if (!this.enabled) {
      console.log('Email service not configured - running in dev mode');
      return true;
    }

    try {
      await this.transporter.verify();
      console.log('Email service verified successfully');
      return true;
    } catch (error) {
      console.error('Email service verification failed:', error);
      return false;
    }
  }
}

// Singleton instance
let emailServiceInstance: EmailService | null = null;

export function getEmailService(): EmailService {
  if (!emailServiceInstance) {
    emailServiceInstance = new EmailService();
  }
  return emailServiceInstance;
}
