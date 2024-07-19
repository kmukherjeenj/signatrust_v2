import { createAgent } from '@veramo/core'
import { IDIDManager, IKeyManager, IDataStore, IResolver, ICredentialPlugin, IIdentifier } from '@veramo/core-types'
import { CredentialPlugin } from '@veramo/credential-w3c'
import { DIDManager } from '@veramo/did-manager'
import { EthrDIDProvider } from '@veramo/did-provider-ethr'
import { AbstractSecretBox, KeyManager } from '@veramo/key-manager'
import { KeyManagementSystem, SecretBox } from '@veramo/kms-local'
import { DIDResolverPlugin } from '@veramo/did-resolver'
import { Resolver } from 'did-resolver'
import { getResolver as ethrDidResolver } from 'ethr-did-resolver'
import { getResolver as webDidResolver } from 'web-did-resolver'
import { DataStore, Entities, KeyStore, DIDStore, PrivateKeyStore } from '@veramo/data-store'
import { DataSource } from 'typeorm'

import { SecureStorage } from '../../lib/storage/SecureStorage'
import { PlatformSecureStorage } from '../../lib/storage/PlatformSecureStorage'
import { log, logError } from '../../client/utils/client_logger'

interface RegistrationData {
  username: string
  email: string
}

function handleError(error: unknown, message: string): Error {
  if (error instanceof Error) {
    logError(error, message)
    return error
  } else {
    const genericError = new Error(message)
    logError(genericError, `${message}: ${String(error)}`)
    return genericError
  }
}

const KMS_SECRET_KEY = process.env.NEXT_PUBLIC_KMS_SECRET_KEY
const INFURA_PROJECT_ID = process.env.NEXT_PUBLIC_INFURA_API_KEY

if (!KMS_SECRET_KEY) {
  throw new Error('NEXT_PUBLIC_KMS_SECRET_KEY is not set in the environment variables')
}

if (!INFURA_PROJECT_ID) {
  throw new Error('NEXT_PUBLIC_INFURA_API_KEY is not set in the environment variables')
}

const secureStorage = new PlatformSecureStorage()

// Create an in-memory data store
const dbConnection = new DataSource({
  type: 'sqlite',
  database: ':memory:',
  synchronize: true,
  logging: false,
  entities: Entities,
})

const dataStore = new DataStore(dbConnection)
const keyStore = new KeyStore(dbConnection)
const didStore = new DIDStore(dbConnection)
const secretBox = new SecretBox(KMS_SECRET_KEY)
const privateKeyStore = new PrivateKeyStore(dbConnection, secretBox)

export const agent = createAgent<IDIDManager & IKeyManager & IDataStore & IResolver & ICredentialPlugin>({
  plugins: [
    new KeyManager({
      store: keyStore,
      kms: {
        local: new KeyManagementSystem(privateKeyStore),
      },
    }),
    new DIDManager({
      store: didStore,
      defaultProvider: 'did:ethr:goerli',
      providers: {
        'did:ethr:goerli': new EthrDIDProvider({
          defaultKms: 'local',
          network: 'goerli',
          rpcUrl: `https://goerli.infura.io/v3/${INFURA_PROJECT_ID}`,
        }),
      },
    }),
    new DIDResolverPlugin({
      resolver: new Resolver({
        ...ethrDidResolver({ networks: [{ name: 'goerli', rpcUrl: `https://goerli.infura.io/v3/${INFURA_PROJECT_ID}` }] }),
        ...webDidResolver(),
      }),
    }),
    new CredentialPlugin(),
    dataStore,
  ],
})

export async function createDID(alias: string): Promise<IIdentifier> {
  try {
    const identifier = await agent.didManagerCreate({
      provider: 'did:ethr:goerli',
      alias,
    })
    log('info', 'DID created', { did: identifier.did })
    return identifier
  } catch (error) {
    throw handleError(error, 'Failed to create DID')
  }
}

export async function getDID(didOrAlias: string): Promise<IIdentifier> {
  try {
    return await agent.didManagerGet({ did: didOrAlias })
  } catch (error) {
    throw handleError(error, 'Failed to retrieve DID')
  }
}

export async function createAccount(formData: RegistrationData): Promise<IIdentifier> {
  try {
    const identifier = await createDID(formData.username)
    await secureStorage.storeDID(identifier)
    log('info', 'Account created', { did: identifier.did, email: formData.email })
    return identifier
  } catch (error) {
    throw handleError(error, 'Failed to create account')
  }
}

export async function verifySignature(signatureJwt: string): Promise<boolean> {
  try {
    const result = await agent.verifyCredential({
      credential: signatureJwt,
    })
    return result.verified
  } catch (error) {
    throw handleError(error, 'Failed to verify signature')
  }
}

export async function authenticate(did: string): Promise<boolean> {
  try {
    const identifier = await getDID(did)
    if (!identifier) {
      throw new Error('DID not found')
    }
    log('info', 'Authentication successful', { did })
    return true
  } catch (error) {
    handleError(error, 'Authentication failed')
    return false
  }
}

export async function issueCredential(subject: any, type: string): Promise<any> {
  try {
    const storedDID = await secureStorage.retrieveDID()
    if (!storedDID) {
      throw new Error('No DID found. Please create an account first.')
    }

    const credential = await agent.createVerifiableCredential({
      credential: {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential', type],
        issuer: { id: storedDID.did },
        issuanceDate: new Date().toISOString(),
        credentialSubject: subject,
      },
      proofFormat: 'jwt',
    })
    log('info', 'Credential issued', { type, subject })
    return credential
  } catch (error) {
    throw handleError(error, 'Failed to issue credential')
  }
}

export async function listAllDIDs(): Promise<IIdentifier[]> {
  try {
    const dids = await agent.didManagerFind()
    log('info', 'DIDs listed', { count: dids.length })
    return dids
  } catch (error) {
    throw handleError(error, 'Failed to list DIDs')
  }
}