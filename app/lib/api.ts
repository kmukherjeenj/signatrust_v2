// lib/api.ts
import axios from "axios";
import { API_URL, ENDPOINTS } from "../config";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add authentication token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add ZK proof headers if available
    const zkProof = localStorage.getItem("zkProof");
    const publicSignals = localStorage.getItem("publicSignals");
    const challenge = localStorage.getItem("challenge");

    if (zkProof && publicSignals && challenge) {
      config.headers["ZK-Proof"] = zkProof;
      config.headers["Public-Signals"] = publicSignals;
      config.headers["Challenge"] = challenge;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear authentication data and redirect to login
      localStorage.removeItem("authToken");
      localStorage.removeItem("zkProof");
      localStorage.removeItem("publicSignals");
      localStorage.removeItem("challenge");
      sessionStorage.removeItem("userDID");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// KYC Verification API functions
export async function getKYCStatus(did: string): Promise<any> {
  try {
    const response = await api.get(
      `${ENDPOINTS.KYC.VERIFICATION_STATUS}/${did}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching KYC status:", error);
    throw error;
  }
}

export async function verifyIdentity(formData: FormData): Promise<any> {
  try {
    const response = await api.post(ENDPOINTS.KYC.VERIFY, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error verifying identity:", error);
    throw error;
  }
}

// Document management API functions
export async function getDocuments(): Promise<any[]> {
  try {
    const response = await api.get(ENDPOINTS.DOCUMENTS.LIST);
    return response.data;
  } catch (error) {
    console.error("Error fetching documents:", error);
    return [];
  }
}

export async function uploadDocument(formData: FormData): Promise<any> {
  try {
    const response = await api.post(ENDPOINTS.DOCUMENTS.UPLOAD, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading document:", error);
    throw error;
  }
}

export async function signDocument(
  documentId: string,
  signatureData: string,
  userId?: string,
  apiKey?: string
): Promise<any> {
  try {
    const headers: any = {};
    if (apiKey) {
      headers["X-API-Key"] = apiKey;
    }

    const response = await api.post(
      `${ENDPOINTS.DOCUMENTS.SIGN}/${documentId}`,
      {
        signatureData,
        userId: userId || sessionStorage.getItem("userDID"),
      },
      { headers }
    );

    return response.data;
  } catch (error) {
    console.error("Error signing document:", error);
    throw error;
  }
}

export async function getSignatureRequests(): Promise<any[]> {
  try {
    const response = await api.get("/signature-requests");
    return response.data;
  } catch (error) {
    console.error("Error fetching signature requests:", error);
    return [];
  }
}

export async function getPendingSignatures(): Promise<any[]> {
  try {
    const response = await api.get("/pending-signatures");
    return response.data;
  } catch (error) {
    console.error("Error fetching pending signatures:", error);
    return [];
  }
}

export async function fetchUserData(did: string): Promise<any> {
  try {
    const response = await api.get(`/users/${did}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}

export default api;
