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
    // We're now just calling the backend API to create the identity
    const response = await api.post<IdentityResponse>('/api/identity', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating account:', error);
    throw new Error('Failed to create account');
  }
}