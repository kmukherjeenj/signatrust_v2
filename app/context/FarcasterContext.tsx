/*'use client'

import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  authenticateUser, 
  createSignatureRequest, 
  getSignatureStatus, 
  signDocument, 
  createUser, 
  //verifyIdentity,
  getAccount
} from '@/services/farcasterAPI';

interface FarcasterUser {
  id: string;
  username: string;
  email: string;
}

interface FarcasterAccount {
  id: string;
  userId: string;
}

interface SignatureRequest {
  id: string;
  documentId: string;
  status: 'pending' | 'completed' | 'rejected';
}

interface SignatureStatus {
  id: string;
  status: 'pending' | 'completed' | 'rejected';
}

interface FarcasterContextValue {
  user: FarcasterUser | null;
  account: FarcasterAccount | null;
  loading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  createSignature: (
    document: File,
    signatories: string[],
    placements: { x: number; y: number }[]
  ) => Promise<SignatureRequest>;
  getSignature: (signatureRequestId: string) => Promise<SignatureStatus>;
  signWithFarcaster: (signatureRequestId: string, signatureData: string) => Promise<void>;
  registerFarcasterAccount: (
    email: string,
    password: string,
    username: string
  ) => Promise<FarcasterAccount>;
  verifyFarcasterIdentity: (
    account: FarcasterAccount,
    documents: File[]
  ) => Promise<FarcasterAccount>;
}

const FarcasterContext = createContext<FarcasterContextValue | undefined>(undefined);

interface FarcasterProviderProps {
  children: ReactNode;
}

export const FarcasterProvider: React.FC<FarcasterProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [account, setAccount] = useState<FarcasterAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('farcasterToken');
    if (storedToken) {
      setToken(storedToken);
      fetchUserData(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async (authToken: string) => {
    try {
      const userData = await getAccount(authToken);
      setUser(userData);
      const accountData = await getAccount(userData.id);
      setAccount(accountData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authenticateUser(email, password);
      setToken(response.token);
      localStorage.setItem('farcasterToken', response.token);
      await fetchUserData(response.token);
    } catch (err) {
      throw new Error(`Login failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      localStorage.removeItem('farcasterToken');
      setUser(null);
      setAccount(null);
      setToken(null);
    } catch (err) {
      throw new Error(`Logout failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, []);

  const refreshUserData = useCallback(async () => {
    if (token) {
      try {
        await fetchUserData(token);
      } catch (err) {
        throw new Error(`Failed to refresh user data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  }, [token]);

  const createSignature = useCallback(async (
    document: File,
    signatories: string[],
    placements: { x: number; y: number }[]
  ): Promise<SignatureRequest> => {
    try {
      return await createSignatureRequest(document, signatories, placements);
    } catch (err) {
      throw new Error(`Failed to create signature: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, []);

  const getSignature = useCallback(async (signatureRequestId: string): Promise<SignatureStatus> => {
    try {
      return await getSignatureStatus(signatureRequestId);
    } catch (err) {
      throw new Error(`Failed to get signature status: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, []);

  const signWithFarcaster = useCallback(async (signatureRequestId: string, signatureData: string): Promise<void> => {
    try {
      await signDocument(signatureRequestId, signatureData);
    } catch (err) {
      throw new Error(`Failed to sign document: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, []);

  const registerFarcasterAccount = useCallback(async (
    email: string,
    password: string,
    username: string
  ): Promise<FarcasterAccount> => {
    try {
      const newUser = await createUser(username, email, password);
      setUser(newUser);
      const newAccount = await getAccount(newUser.id);
      setAccount(newAccount);
      return newAccount;
    } catch (err) {
      throw new Error(`Failed to register account: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, []);

  const verifyFarcasterIdentity = useCallback(async (
    account: FarcasterAccount,
    documents: File[]
  ): Promise<FarcasterAccount> => {
    try {
      const verifiedAccount = await verifyIdentity(account, documents);
      setAccount(verifiedAccount);
      return verifiedAccount;
    } catch (err) {
      throw new Error(`Failed to verify identity: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, []);

  const contextValue: FarcasterContextValue = {
    user,
    account,
    loading,
    error,
    login,
    logout,
    refreshUserData,
    createSignature,
    getSignature,
    signWithFarcaster,
    registerFarcasterAccount,
    verifyFarcasterIdentity,
  };

  return (
    <FarcasterContext.Provider value={contextValue}>
      {children}
    </FarcasterContext.Provider>
  );
};

export default FarcasterContext;   */

'use client'

import React, { createContext, useState, useCallback, ReactNode } from 'react';

// Simplified interfaces
interface User {
  id: string;
  username: string;
  email: string;
}

interface Account {
  id: string;
  userId: string;
}

interface FarcasterContextValue {
  user: User | null;
  account: Account | null;
  loading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  registerFarcasterAccount: (email: string, password: string, username: string) => Promise<void>;
}

const FarcasterContext = createContext<FarcasterContextValue | undefined>(undefined);

interface FarcasterProviderProps {
  children: ReactNode;
}

export const FarcasterProvider: React.FC<FarcasterProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      // Placeholder login logic
      setUser({ id: '1', username: email.split('@')[0], email });
      setAccount({ id: '1', userId: '1' });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Login failed'));
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setAccount(null);
  }, []);

  const registerFarcasterAccount = useCallback(async (email: string, password: string, username: string) => {
    setLoading(true);
    try {
      // Placeholder registration logic
      setUser({ id: '1', username, email });
      setAccount({ id: '1', userId: '1' });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Registration failed'));
    } finally {
      setLoading(false);
    }
  }, []);

  const contextValue: FarcasterContextValue = {
    user,
    account,
    loading,
    error,
    login,
    logout,
    registerFarcasterAccount,
  };

  return (
    <FarcasterContext.Provider value={contextValue}>
      {children}
    </FarcasterContext.Provider>
  );
};

export default FarcasterContext;