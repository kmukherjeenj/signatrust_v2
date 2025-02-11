export type SignatureType = 'simple' | 'advanced' | 'qualified';
export type Jurisdiction = 'US' | 'EU' | 'UK' | 'CA' | 'AU' | 'IN' | 'CN' | 'SG';
export type SignatureStatus = 'pending' | 'completed' | 'rejected' | 'expired';
export interface UserData {
  did: string;
  name?: string;
  email?: string;
  preferredSignatureType?: SignatureType;
  defaultJurisdiction?: Jurisdiction;
}

export interface Document {
  id: string;
  name: string;
  status: 'pending' | 'signed' | 'expired';
  date: string;
  // Adding hash and signers from the previous implementation
  hash?: string;
  signers?: string[];
  documentHash?: string;
  signatureMetadata?: {
    signatureType: SignatureType;
    jurisdiction: Jurisdiction;
  };
}

export interface SignatureRequest {
  id: string;
  documentId: string;
  documentName: string;
  recipientEmail: string;
  status: SignatureStatus;
  signers: string[];
  createdAt: string;
  documentHash?: string;
  signatureMetadata?: {
    intent: string;
    consentToElectronic: boolean;
    signatureMethod: string;
    signatureType: SignatureType;
    jurisdiction: Jurisdiction;
  };
  legalCompliance?: {
    intentCaptured: boolean;
    consentRecorded: boolean;
    signatureAssociation: string;
    retentionPeriod: number;
    securityMeasures: string[];
  };
  zkProof?: {
    proof: string;
    publicSignals: string[];
  };
  blockchainRecord?: {
    transactionHash: string;
    blockNumber: number;
    timestamp: Date;
  };
}