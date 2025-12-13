import twilio from 'twilio';

interface SmsConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

interface SigningLinkParams {
  to: string;
  documentName: string;
  signingUrl: string;
}

/**
 * SMS Service for sending magic signing links via Twilio
 */
export class SmsService {
  private client: twilio.Twilio | null = null;
  private fromNumber: string;
  private enabled: boolean;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_FROM_NUMBER || '';

    this.enabled = Boolean(accountSid && authToken && this.fromNumber);

    if (!this.enabled) {
      console.log('SMS service disabled - Twilio credentials not configured');
      return;
    }

    this.client = twilio(accountSid, authToken);
    console.log('SMS service initialized with Twilio');
  }

  /**
   * Format phone number to E.164 format
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters except leading +
    let cleaned = phone.replace(/[^\d+]/g, '');

    // If no country code, assume US (+1)
    if (!cleaned.startsWith('+')) {
      if (cleaned.length === 10) {
        cleaned = '+1' + cleaned;
      } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
        cleaned = '+' + cleaned;
      } else {
        cleaned = '+' + cleaned;
      }
    }

    return cleaned;
  }

  /**
   * Send magic signing link via SMS
   */
  async sendSigningLink(params: SigningLinkParams): Promise<boolean> {
    const { to, documentName, signingUrl } = params;

    const formattedNumber = this.formatPhoneNumber(to);

    // Truncate document name if too long for SMS
    const truncatedName = documentName.length > 30
      ? documentName.substring(0, 27) + '...'
      : documentName;

    const message = `SignaTrust: You've been requested to sign "${truncatedName}". Tap to review and sign: ${signingUrl}`;

    if (!this.enabled || !this.client) {
      console.log('SMS (dev mode):', {
        to: formattedNumber,
        message,
      });
      return true;
    }

    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: formattedNumber,
      });

      console.log(`SMS sent to ${formattedNumber}, SID: ${result.sid}`);
      return true;
    } catch (error) {
      console.error('Failed to send SMS:', error);
      return false;
    }
  }

  /**
   * Send signing complete notification via SMS
   */
  async sendSigningComplete(params: { to: string; documentName: string }): Promise<boolean> {
    const { to, documentName } = params;

    const formattedNumber = this.formatPhoneNumber(to);

    const truncatedName = documentName.length > 30
      ? documentName.substring(0, 27) + '...'
      : documentName;

    const message = `SignaTrust: "${truncatedName}" has been fully signed by all parties and recorded on the blockchain.`;

    if (!this.enabled || !this.client) {
      console.log('SMS (dev mode):', {
        to: formattedNumber,
        message,
      });
      return true;
    }

    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: formattedNumber,
      });

      console.log(`Completion SMS sent to ${formattedNumber}, SID: ${result.sid}`);
      return true;
    } catch (error) {
      console.error('Failed to send completion SMS:', error);
      return false;
    }
  }

  /**
   * Send session cancelled notification via SMS
   */
  async sendSessionCancelled(params: { to: string; documentName: string }): Promise<boolean> {
    const { to, documentName } = params;

    const formattedNumber = this.formatPhoneNumber(to);

    const truncatedName = documentName.length > 30
      ? documentName.substring(0, 27) + '...'
      : documentName;

    const message = `SignaTrust: The signing request for "${truncatedName}" has been cancelled by the document creator.`;

    if (!this.enabled || !this.client) {
      console.log('SMS (dev mode):', {
        to: formattedNumber,
        message,
      });
      return true;
    }

    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: formattedNumber,
      });

      console.log(`Cancellation SMS sent to ${formattedNumber}, SID: ${result.sid}`);
      return true;
    } catch (error) {
      console.error('Failed to send cancellation SMS:', error);
      return false;
    }
  }

  /**
   * Verify SMS configuration
   */
  async verify(): Promise<boolean> {
    if (!this.enabled) {
      console.log('SMS service not configured - running in dev mode');
      return true;
    }

    try {
      // Verify account by fetching account info
      const account = await this.client!.api.accounts(process.env.TWILIO_ACCOUNT_SID!).fetch();
      console.log(`SMS service verified - Account: ${account.friendlyName}`);
      return true;
    } catch (error) {
      console.error('SMS service verification failed:', error);
      return false;
    }
  }

  /**
   * Check if SMS is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

// Singleton instance
let smsServiceInstance: SmsService | null = null;

export function getSmsService(): SmsService {
  if (!smsServiceInstance) {
    smsServiceInstance = new SmsService();
  }
  return smsServiceInstance;
}
