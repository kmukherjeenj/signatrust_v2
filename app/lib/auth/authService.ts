import { createAgent, IDIDManager, IKeyManager, IDataStore, IResolver, ICredentialPlugin, IIdentifier, IAgentContext, IKey } from '@veramo/core';
import { CredentialPlugin } from '@veramo/credential-w3c';
import { DIDManager, AbstractDIDStore } from '@veramo/did-manager';
import { EthrDIDProvider } from '@veramo/did-provider-ethr';
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '@veramo/key-manager';
import { KeyManagementSystem } from '@veramo/kms-local';
import { DIDResolverPlugin } from '@veramo/did-resolver';
import { Resolver } from 'did-resolver';
import { getResolver as ethrDidResolver } from 'ethr-did-resolver';
import { getResolver as webDidResolver } from 'web-did-resolver';

// Import the SecureStorage interface and PlatformSecureStorage implementation
import { SecureStorage } from '../../lib/storage/SecureStorage';
import { PlatformSecureStorage } from '../../lib/storage/PlatformSecureStorage';

interface RegistrationData {
  username: string;
  email: string;
}

// Implement a basic in-memory DID store
class MemoryDIDStore extends AbstractDIDStore {
  private dids: Record<string, IIdentifier> = {};
  private aliases: Record<string, string> = {};

  async importDID(args: IIdentifier): Promise<boolean> {
    this.dids[args.did] = args;
    if (args.alias) {
      this.aliases[args.alias] = args.did;
    }
    return true;
  }

  async getDID(args: { did: string; }): Promise<IIdentifier>;
  async getDID(args: { alias: string; }): Promise<IIdentifier>;
  async getDID(args: { did?: string; alias?: string; }): Promise<IIdentifier> {
    if ('did' in args && args.did) {
      const identifier = this.dids[args.did];
      if (!identifier) {
        throw new Error(`DID not found: ${args.did}`);
      }
      return identifier;
    } else if ('alias' in args && args.alias) {
      const did = this.aliases[args.alias];
      if (!did) {
        throw new Error(`Alias not found: ${args.alias}`);
      }
      return this.dids[did];
    }
    throw new Error('Invalid arguments: either did or alias must be provided');
  }

  async deleteDID({ did }: { did: string }): Promise<boolean> {
    if (this.dids[did]) {
      const alias = Object.keys(this.aliases).find(key => this.aliases[key] === did);
      if (alias) {
        delete this.aliases[alias];
      }
      delete this.dids[did];
      return true;
    }
    return false;
  }

  async listDIDs(): Promise<IIdentifier[]> {
    return Object.values(this.dids);
  }
}

// Initialize Veramo agent
const infuraApiKey = process.env.INFURA_API_KEY;
if (!infuraApiKey) {
  throw new Error('INFURA_API_KEY is not set in the environment variables');
}
const secureStorage = new PlatformSecureStorage();

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

    await secureStorage.storeDID(identifier);

    console.log('Account created:', { did: identifier.did, email: formData.email });

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

export async function authenticate(): Promise<boolean> {
  try {
    const storedDID = await secureStorage.retrieveDID();
    if (!storedDID) {
      throw new Error('No DID found. Please create an account first.');
    }

    // Here you would typically perform biometric authentication
    // For simplicity, we're just checking if the DID exists
    return true;
  } catch (error) {
    console.error('Authentication error:', error);
    return false;
  }
}

export async function issueCredential(subject: any, type: string) {
  try {
    const storedDID = await secureStorage.retrieveDID();
    if (!storedDID) {
      throw new Error('No DID found. Please create an account first.');
    }

    const credential = await agent.createVerifiableCredential({
      credential: {
        type: ['VerifiableCredential', type],
        issuer: { id: storedDID.did },
        credentialSubject: subject,
      },
      proofFormat: 'jwt',
    });
    return credential;
  } catch (error) {
    console.error('Error issuing credential:', error);
    throw new Error('Failed to issue credential');
  }
}