// services/DocumentManagementService.ts
import { IPFSStorage } from '../integrations/IPFSStorage.ts';
import { EncryptionService } from './EncryptionService.ts';
import { SolanaDIDService } from './SolanaDIDService.ts';

export class DocumentManagementService {
  private ipfsStorage: IPFSStorage;
  private encryptionService: EncryptionService;
  private solanaDIDService: SolanaDIDService;

  constructor() {
    this.ipfsStorage = new IPFSStorage();
    this.encryptionService = new EncryptionService();
    this.solanaDIDService = new SolanaDIDService();
  }

  async storeDocument(did: string, document: Buffer): Promise<string> {
    const encryptedDocument = await this.encryptionService.encrypt(document);
    const ipfsHash = await this.ipfsStorage.store(encryptedDocument);
    const documentHash = await this.solanaDIDService.storeDocumentHash(did, ipfsHash);
    return documentHash;
  }

  async retrieveDocument(did: string, documentHash: string): Promise<Buffer> {
    const ipfsHash = await this.solanaDIDService.getDocumentIPFSHash(documentHash);
    const encryptedDocument = await this.ipfsStorage.retrieve(ipfsHash);
    return this.encryptionService.decrypt(encryptedDocument);
  }

  async updateDocument(did: string, documentHash: string, newDocument: Buffer): Promise<string> {
    const encryptedDocument = await this.encryptionService.encrypt(newDocument);
    const newIpfsHash = await this.ipfsStorage.store(encryptedDocument);
    return this.solanaDIDService.updateDocumentHash(did, documentHash, newIpfsHash);
  }

  async verifyDocumentHash(documentHash: string): Promise<boolean> {
    try {
      // Attempt to retrieve the IPFS hash for the given document hash
      const ipfsHash = await this.solanaDIDService.getDocumentIPFSHash(documentHash);
      
      // If we get an IPFS hash, the document hash is valid
      // We could add additional checks here if needed
      return !!ipfsHash;
    } catch (error) {
      // If an error occurs (e.g., document hash not found), the hash is invalid
      console.error('Error verifying document hash:', error);
      return false;
    }
  }
}