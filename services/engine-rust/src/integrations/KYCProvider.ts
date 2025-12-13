import axios from 'axios';

interface KYCResult {
  verified: boolean;
  score: number;
  reason?: string;
}

export class KYCProvider {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = process.env.KYC_PROVIDER_API_URL || 'https://api.kycprovider.com';
    this.apiKey = process.env.KYC_PROVIDER_API_KEY || 'your-api-key-here';
  }

  async performKYC(userId: string, identityData: any): Promise<KYCResult> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/verify`,
        {
          userId,
          ...identityData
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = response.data;

      return {
        verified: result.verified,
        score: result.score,
        reason: result.reason
      };
    } catch (error) {
      console.error('KYC verification failed:', error);
      throw new Error('KYC verification failed');
    }
  }

  async getUserVerificationStatus(userId: string): Promise<boolean> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/status/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data.verified;
    } catch (error) {
      console.error('Failed to get user verification status:', error);
      throw new Error('Failed to get user verification status');
    }
  }
}