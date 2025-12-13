// services/LUVService.ts

import { SolanaDIDService } from './SolanaDIDService.ts';
import { ZKProofService } from './ZKProofService.ts';
import { DocumentManagementService } from './DocumentManagementService.ts';
import crypto from 'crypto';

export class LUVService {
  private solanaDIDService: SolanaDIDService;
  private zkProofService: ZKProofService;
  private documentManagementService: DocumentManagementService;

  constructor() {
    this.solanaDIDService = new SolanaDIDService();
    this.zkProofService = new ZKProofService();
    this.documentManagementService = new DocumentManagementService();
  }

  async createLUV(did: string, documentHash: string): Promise<string> {
    // Generate a unique identifier for the LUV
    const luvId = this.generateLUVId(did, documentHash);

    // Create a ZK proof that the user owns the DID and the document
    const zkProof = await this.zkProofService.generateLUVProof(did, documentHash);

    // Store the LUV on Solana
    const transaction = await this.solanaDIDService.storeLUV(did, luvId, documentHash, zkProof);

    return luvId;
  }

  async verifyLUV(luvId: string): Promise<boolean> {
    // Retrieve the LUV data from Solana
    const luvData = await this.solanaDIDService.getLUVData(luvId);

    if (!luvData) {
      return false;
    }

    // Verify the ZK proof
    const isProofValid = await this.zkProofService.verifyLUVProof(luvData.zkProof, luvData.did, luvData.documentHash);

    if (!isProofValid) {
      return false;
    }

    // Verify the document hash
    const isDocumentValid = await this.documentManagementService.verifyDocumentHash(luvData.documentHash);

    return isDocumentValid;
  }

  private generateLUVId(did: string, documentHash: string): string {
    const data = did + documentHash + Date.now().toString();
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}