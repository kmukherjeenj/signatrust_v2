// app/lib/veramo.ts

/*import { createAgent, IDIDManager, IKeyManager, IResolver, IDataStore, ICredentialPlugin } from '@veramo/core';
import { CredentialPlugin } from '@veramo/credential-w3c';
import { DIDManager } from '@veramo/did-manager';
import { EthrDIDProvider } from '@veramo/did-provider-ethr';
import { KeyManager } from '@veramo/key-manager';
import { KeyManagementSystem } from '@veramo/kms-local';

export const agent = createAgent<IDIDManager & IKeyManager & IResolver & IDataStore & ICredentialPlugin>({
  plugins: [
    new KeyManager({
      store: new KeyManagementSystem(new Map()),
      kms: {
        local: new KeyManagementSystem(new Map()),
      },
    }),
    new DIDManager({
      store: new Map(),
      defaultProvider: 'did:ethr',
      providers: {
        'did:ethr': new EthrDIDProvider({
          defaultKms: 'local',
          network: 'goerli',
          rpcUrl: process.env.ETHEREUM_RPC_URL,
        }),
      },
    }),
    new CredentialPlugin(),
  ],
});*/