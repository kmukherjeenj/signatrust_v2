import api from './api';

interface UserData {
  username: string;
  email: string;
}

interface IdentityResponse {
  did: string;
  publicKey: string;
}

export async function createAccount(userData: UserData): Promise<IdentityResponse> {
  try {
    // Add this console log to verify the exact URL being used
    console.log('Sending request to:', '/create');
    
    const response = await api.post<IdentityResponse>('/identity/create', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating account:', error);
    throw new Error('Failed to create account');
  }
}