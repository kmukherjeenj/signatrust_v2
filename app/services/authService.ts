// File: app/services/authService.ts

import { createAgent, IIdentifier, IDIDManager, IKeyManager, IDataStore, IResolver, ICredentialPlugin } from '@veramo/core';
import { CredentialPlugin } from '@veramo/credential-w3c';
import { DIDManager, MemoryDIDStore } from '@veramo/did-manager';
import { EthrDIDProvider } from '@veramo/did-provider-ethr';
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '@veramo/key-manager';
import { KeyManagementSystem } from '@veramo/kms-local';
import { DIDResolverPlugin } from '@veramo/did-resolver';
import { Resolver } from 'did-resolver';
import { getResolver as ethrDidResolver } from 'ethr-did-resolver';
import { getResolver as webDidResolver } from 'web-did-resolver';

interface RegistrationData {
  username: string;
  email: string;
  password: string;
}

// Initialize Veramo agent
const infuraApiKey = process.env.INFURA_API_KEY || 'YOUR_INFURA_API_KEY';

export const agent = createAgent<IDIDManager & IKeyManager & IDataStore & IResolver & ICredentialPlugin>({
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
    new DIDResolverPlugin({
      resolver: new Resolver({
        ...ethrDidResolver({ networks: [{ name: 'goerli', rpcUrl: `https://goerli.infura.io/v3/${infuraApiKey}` }] }),
        ...webDidResolver(),
      }),
    }),
    new CredentialPlugin(),
  ],
});

export async function createAccount(formData: RegistrationData): Promise<IIdentifier> {
  try {
    const identifier = await agent.didManagerCreate({
      provider: 'did:ethr:goerli',
      alias: formData.username,
    });

    // Here you would typically handle the email and password
    // For example, you might want to store them securely or use them for authentication
    console.log('Account created:', { did: identifier.did, email: formData.email });

    // Note: In a real-world scenario, you should never log or store passwords in plain text
    // This is just for demonstration purposes

    return identifier;
  } catch (error) {
    console.error('Error creating account:', error);
    throw new Error('Failed to create account');
  }
}
export async function verifySignature(signatureJwt: string) {
    try {
      const result = await agent.verifyCredential({
        credential: signatureJwt,
        proofFormat: 'jwt'
      });
      return result.verified;
    } catch (error) {
      console.error('Signature verification error:', error);
      throw new Error('Failed to verify signature');
    }
  }

// You can add more functions here as needed, such as verifyCredential, issueCredential, etc.