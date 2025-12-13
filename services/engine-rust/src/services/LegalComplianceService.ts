// services/LegalComplianceService.ts
import { SolanaDIDService } from './SolanaDIDService.ts';

export class LegalComplianceService {
  private solanaDIDService: SolanaDIDService;

  constructor() {
    this.solanaDIDService = new SolanaDIDService();
  }

  async recordSigningIntent(did: string, documentHash: string, intent: string): Promise<string> {
    return this.solanaDIDService.recordSigningIntent(did, documentHash, intent);
  }

  async verifyCompliance(documentHash: string): Promise<boolean> {
    const signingIntents = await this.solanaDIDService.getSigningIntents(documentHash);
    const signatures = await this.solanaDIDService.getDocumentSignatures(documentHash);
    
    // Implement compliance checks based on relevant e-signature laws
    // This is a simplified example and should be expanded based on specific legal requirements
    return signingIntents.length === signatures.length && this.verifyIntentTimestamps(signingIntents, signatures);
  }

  private verifyIntentTimestamps(intents: any[], signatures: any[]): boolean {
    // Verify that all intents were recorded before signatures
    // This is a simplified check and should be expanded based on specific legal requirements
    return intents.every(intent => 
      signatures.some(sig => new Date(sig.timestamp) > new Date(intent.timestamp))
    );
  }
}