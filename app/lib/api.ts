import axios from 'axios';
import { UserData, Document, SignatureRequest, SignatureType, Jurisdiction } from '../shared/types';
import { deriveDidFromPublicSignals, generateChallenge, generateProof  } from '../utils/didUtils';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add an interceptor to include the authentication headers
/*api.interceptors.request.use((config) => {
  const zkProof = localStorage.getItem('zkProof');
  const publicSignals = localStorage.getItem('publicSignals');
  const challenge = localStorage.getItem('challenge');

  console.log('Sending headers:');
  console.log('ZK-Proof:', zkProof);
  console.log('Public-Signals:', publicSignals);
  console.log('Challenge:', challenge);

  if (zkProof && publicSignals && challenge) {
    const parsedPublicSignals = JSON.parse(publicSignals);
    const derivedDID = deriveDidFromPublicSignals(parsedPublicSignals);

    config.headers['ZK-Proof'] = zkProof;
    config.headers['Public-Signals'] = publicSignals;
    config.headers['Challenge'] = challenge;
    console.log('Original DID:', localStorage.getItem('originalDID'));
    console.log('Transformed DID (Public-Signals):', publicSignals);
    }
  console.log('Final request config:', config);
  return config;
});*/

api.interceptors.request.use(async (config) => {
  const did = localStorage.getItem('userDID');
  if (did) {
    try {
      const challenge = generateChallenge();
      const { proof, publicSignals } = await generateProof(did, challenge);

      config.headers['ZK-Proof'] = JSON.stringify(proof);
      config.headers['Public-Signals'] = JSON.stringify(publicSignals);
      config.headers['Challenge'] = challenge;

      console.log('Sending headers:', {
        'ZK-Proof': config.headers['ZK-Proof'],
        'Public-Signals': config.headers['Public-Signals'],
        'Challenge': config.headers['Challenge'],
      });

      const derivedDID = deriveDidFromPublicSignals(publicSignals);
      console.log('Original DID:', did);
      console.log('Derived DID:', derivedDID);
    } catch (error) {
      console.error('Error generating proof for request:', error);
      // You might want to redirect to login page or show an error message to the user here
    }
  } else {
    console.log('No DID found in localStorage');
  }
  console.log('Final request config:', config);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
      // Handle specific error codes here
      if (error.response.status === 401) {
        console.log('Authentication error, redirecting to login page');
        // Implement redirect to login page or show authentication error
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

export const fetchUserData = async (did: string): Promise<UserData> => {
  // Existing implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        did: did,
        name: 'Kushal Mukherjee',
        email: 'kushal.mukherjee@example.com',
        preferredSignatureType: 'advanced' as SignatureType,
        defaultJurisdiction: 'US' as Jurisdiction,
      });
    }, 1000);
  });
};

// New function to get user preferences
export const getUserPreferences = async (did: string): Promise<{ preferredSignatureType: SignatureType, defaultJurisdiction: Jurisdiction }> => {
  const response = await api.get(`/user/${did}/preferences`);
  return response.data;
};

// New function to update user preferences
export const updateUserPreferences = async (did: string, preferences: { preferredSignatureType?: SignatureType, defaultJurisdiction?: Jurisdiction }): Promise<void> => {
  await api.put(`/user/${did}/preferences`, preferences);
};

// Enhanced signDocument function to include compliance data
export const signDocumentWithCompliance = async (documentId: string, signature: string, complianceData: {
  intent: string,
  consentToElectronic: boolean,
  signatureType: SignatureType,
  jurisdiction: Jurisdiction
}): Promise<void> => {
  await api.post(`/document/${documentId}/sign`, { signature, complianceData });
};

// New function to get compliance information for a document
export const getDocumentCompliance = async (documentId: string): Promise<{
  intentCaptured: boolean,
  consentRecorded: boolean,
  signatureAssociation: string,
  retentionPeriod: number,
  securityMeasures: string[]
}> => {
  const response = await api.get(`/document/${documentId}/compliance`);
  return response.data;
};

// New function to get blockchain record for a document
export const getBlockchainRecord = async (documentId: string): Promise<{
  transactionHash: string,
  blockNumber: number,
  timestamp: Date
}> => {
  const response = await api.get(`/document/${documentId}/blockchain-record`);
  return response.data;
};

// New function to generate ZK proof
export const generateZKProof = async (documentId: string): Promise<{
  proof: string,
  publicSignals: string[]
}> => {
  const response = await api.post(`/document/${documentId}/generate-zk-proof`);
  return response.data;
};

// New function to verify ZK proof
export const verifyZKProof = async (documentId: string, proof: string, publicSignals: string[]): Promise<boolean> => {
  const response = await api.post(`/document/${documentId}/verify-zk-proof`, { proof, publicSignals });
  return response.data;
};

export const getDocuments = async (): Promise<Document[]> => {
  const response = await api.get('/document');
  return response.data;
};

export const uploadDocument = async (formData: FormData): Promise<Document> => {
  const response = await api.post('/document/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getDocument = async (documentId: string, key: string): Promise<Document> => {
  const response = await api.get(`/document/${documentId}`, { params: { key } });
  return response.data;
};

export const signDocument = async (documentId: string, signature: string): Promise<void> => {
  await api.post(`/document/${documentId}/sign`, { signature });
};

export const verifyDocument = async (documentId: string): Promise<boolean> => {
  const response = await api.get(`/document/${documentId}/verify`);
  return response.data;
};

export const createDID = async () => {
  const response = await api.post('/api/identity/create');
  return response.data;
};

export const getDocumentStatus = async (documentId: string): Promise<string> => {
  const response = await api.get(`/document/${documentId}/status`);
  return response.data;
};

export const getPendingSignatures = async (): Promise<SignatureRequest[]> => {
  const response = await api.get('/pending-signatures');
  return response.data;
};

export const createSignatureRequest = async (documentId: string, signers: string[]): Promise<SignatureRequest> => {
  const response = await api.post('/document/signature-requests', { documentId, signers });
  return response.data;
};

export const getSignatureRequests = async (): Promise<SignatureRequest[]> => {
  try {
    console.log('Fetching signature requests');
    const response = await api.get('/document/signature-requests');
    console.log('Signature requests response:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error fetching signature requests:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
    } else {
      console.error('Unknown error:', error);
    }
    throw error;
  }
};

export default api;