import { SolanaDIDService } from './SolanaDIDService.ts';
import { EncryptionService } from './EncryptionService.ts';

export class MobileSigningService {
  private solanaDIDService: SolanaDIDService;
  private encryptionService: EncryptionService;
  private mobilePublicKey: string;
  private mobilePrivateKey: string;

  constructor() {
    this.solanaDIDService = new SolanaDIDService();
    this.encryptionService = new EncryptionService();
    const { publicKey, privateKey } = this.encryptionService.generateMobileKeyPair();
    this.mobilePublicKey = publicKey;
    this.mobilePrivateKey = privateKey;
  }

  async generateMobileSigningPayload(did: string, documentHash: string): Promise<string> {
    const challenge = await this.solanaDIDService.generateSigningChallenge(documentHash);
    const payload = JSON.stringify({ did, documentHash, challenge });
    return this.encryptionService.encryptForMobile(payload, this.mobilePublicKey);
  }

  async verifyMobileSignature(encryptedPayload: string, signature: string): Promise<boolean> {
    const decryptedPayload = this.encryptionService.decryptFromMobile(encryptedPayload, this.mobilePrivateKey);
    const { did, documentHash, challenge } = JSON.parse(decryptedPayload);
    return this.solanaDIDService.verifyMobileSignature(did, documentHash, challenge, signature);
  }

  getMobilePublicKey(): string {
    return this.mobilePublicKey;
  }
}