// app/services/authService.ts

import { createAgent, IIdentifier, IAgent, IDIDManager } from '@veramo/core';
import { DIDManager, MemoryDIDStore } from '@veramo/did-manager';
import { EthrDIDProvider } from '@veramo/did-provider-ethr';
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '@veramo/key-manager';
import { KeyManagementSystem } from '@veramo/kms-local';

// Initialize Veramo agent
const infuraApiKey = '2CM1YixR7iSGzmp3Myp5Qc3HKvA'; // Replace with your Infura API Key

export const agent = createAgent<IDIDManager>({
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
          rpcUrl: `https://goerli.infura.io/v3/${infuraApiKey}`,
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
    const identifier = await agent.didManagerCreate({
      provider: 'did:ethr:goerli',
      alias: accountData.username,
    });

    const hashedPassword = await hashPassword(accountData.password);

    const accountInfo = {
      did: identifier.did,
      email: accountData.email,
      hashedPassword,
    };

    await storeAccountInfo(accountInfo);

    return identifier;
  } catch (error) {
    console.error('Error creating account:', error);
    throw new Error('Failed to create account');
  }
};

async function hashPassword(password: string): Promise<string> {
  // TODO: Implement proper password hashing
  return password; // This is just a placeholder
}

async function storeAccountInfo(accountInfo: any): Promise<void> {
  // TODO: Implement secure storage of account info
  console.log('Storing account info:', accountInfo);
}