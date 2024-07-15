// app/services/authService.ts

import { createAgent, IIdentifier } from '@veramo/core';
import { DIDManager, MemoryDIDStore } from '@veramo/did-manager';
import { EthrDIDProvider } from '@veramo/did-provider-ethr';
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '@veramo/key-manager';
import { KeyManagementSystem } from '@veramo/kms-local';

// Initialize Veramo agent
const infuraProjectId = 'YOUR-PROJECT-ID'; // Replace with your Infura project ID

const agent = createAgent({
  plugins: [
    new KeyManager({
      store: new MemoryKeyStore(),
      kms: {
        local: new KeyManagementSystem(new MemoryPrivateKeyStore()),
      },
    }),
    new DIDManager({
      store: new MemoryDIDStore(),
      defaultProvider: 'did:ethr:goerli',
      providers: {
        'did:ethr:goerli': new EthrDIDProvider({
          defaultKms: 'local',
          network: 'goerli',
          rpcUrl: `https://goerli.infura.io/v3/${infuraProjectId}`,
        }),
      },
    }),
  ],
});

interface AccountData {
  username: string;
  email: string;
  password: string;
}

export const createAccount = async (accountData: AccountData): Promise<IIdentifier> => {
  try {
    // Create a new DID
    const identifier = await agent.didManagerCreate({
      provider: 'did:ethr:goerli',
      alias: accountData.username,
    });

    // Hash the password (use a proper password hashing library in production)
    const hashedPassword = await hashPassword(accountData.password);

    // Store the account information securely
    // In a real application, you'd use a secure database
    const accountInfo = {
      did: identifier.did,
      email: accountData.email,
      hashedPassword,
    };

    // Store accountInfo securely (implement this part)
    await storeAccountInfo(accountInfo);

    return identifier;
  } catch (error) {
    console.error('Error creating account:', error);
    throw new Error('Failed to create account');
  }
};

// Implement these functions securely
async function hashPassword(password: string): Promise<string> {
  // Use a proper password hashing library like bcrypt
  return password; // This is just a placeholder
}

async function storeAccountInfo(accountInfo: any): Promise<void> {
  // Implement secure storage of account info
  console.log('Storing account info:', accountInfo);
}