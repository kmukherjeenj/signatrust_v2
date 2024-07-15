// File: app/services/veramo.ts
/*
import { createAgent, IDataStore, IDIDManager, IKeyManager, IResolver } from '@veramo/core'
import { CredentialIssuer, ICredentialIssuer } from '@veramo/credential-w3c'
import { DIDManager } from '@veramo/did-manager'
import { DIDResolverPlugin } from '@veramo/did-resolver'
import { KeyManager } from '@veramo/key-manager'
import { KeyManagementSystem, SecretBox } from '@veramo/kms-local'
import { Resolver } from 'did-resolver'
import { getResolver as ethrDidResolver } from 'ethr-did-resolver'
import { getResolver as webDidResolver } from 'web-did-resolver'

// Initialize Veramo agent
const KMS_SECRET_KEY = process.env.KMS_SECRET_KEY

export const agent = createAgent<
  IDIDManager & IKeyManager & IDataStore & IResolver & ICredentialIssuer
>({
  plugins: [
    new KeyManager({
      store: new KeyManagementSystem(new SecretBox(KMS_SECRET_KEY)),
      kms: {
        local: new KeyManagementSystem(new SecretBox(KMS_SECRET_KEY)),
      },
    }),
    new DIDManager({
      store: new KeyManagementSystem(new SecretBox(KMS_SECRET_KEY)),
      defaultProvider: 'did:ethr:goerli',
      providers: {
        'did:ethr:goerli': new EthrDIDProvider({
          defaultKms: 'local',
          network: 'goerli',
          rpcUrl: `https://goerli.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
        }),
        'did:web': new WebDIDProvider({
          defaultKms: 'local',
        }),
      },
    }),
    new DIDResolverPlugin({
      resolver: new Resolver({
        ...ethrDidResolver({ networks: [{ name: 'goerli', rpcUrl: `https://goerli.infura.io/v3/${process.env.INFURA_PROJECT_ID}` }] }),
        ...webDidResolver(),
      }),
    }),
    new CredentialIssuer(),
  ],
})

// File: app/services/signature.ts

import { agent } from './veramo'
import { v4 as uuidv4 } from 'uuid'

export async function createSignature(signerDid: string, documentHash: string) {
  const credential = await agent.createVerifiableCredential({
    credential: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential', 'DocumentSignature'],
      issuer: signerDid,
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: `urn:uuid:${uuidv4()}`,
        documentHash,
        signedAt: new Date().toISOString(),
      },
    },
    proofFormat: 'jwt',
  })

  return credential
}

export async function verifySignature(signedCredential: any) {
  const result = await agent.verifyCredential({
    credential: signedCredential,
  })

  return result.verified
}

// File: app/api/sign/route.ts

import { NextResponse } from 'next/server'
import { createSignature } from '@/app/services/signature'

export async function POST(request: Request) {
  const { signerDid, documentHash } = await request.json()

  try {
    const signature = await createSignature(signerDid, documentHash)
    return NextResponse.json({ signature })
  } catch (error) {
    console.error('Signature creation failed:', error)
    return NextResponse.json({ error: 'Signature creation failed' }, { status: 500 })
  }
}

// File: app/api/verify/route.ts

import { NextResponse } from 'next/server'
import { verifySignature } from '@/app/services/signature'

export async function POST(request: Request) {
  const { signedCredential } = await request.json()

  try {
    const isValid = await verifySignature(signedCredential)
    return NextResponse.json({ isValid })
  } catch (error) {
    console.error('Signature verification failed:', error)
    return NextResponse.json({ error: 'Signature verification failed' }, { status: 500 })
  }
}

// File: app/components/SignatureForm.tsx

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignatureForm() {
  const [documentHash, setDocumentHash] = useState('')
  const [signerDid, setSignerDid] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signerDid, documentHash }),
      })
      const data = await response.json()
      if (data.signature) {
        router.push(`/signature/${data.signature.proof.jwt}`)
      }
    } catch (error) {
      console.error('Signing failed:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={documentHash}
        onChange={(e) => setDocumentHash(e.target.value)}
        placeholder="Document Hash"
        required
      />
      <input
        type="text"
        value={signerDid}
        onChange={(e) => setSignerDid(e.target.value)}
        placeholder="Signer DID"
        required
      />
      <button type="submit">Sign Document</button>
    </form>
  )
}

// File: app/page.tsx

import SignatureForm from './components/SignatureForm'

export default function Home() {
  return (
    <main>
      <h1>Next-Gen Digital Signature Platform</h1>
      <SignatureForm />
    </main>
  )
}

// File: app/signature/[id]/page.tsx

import { verifySignature } from '@/app/services/signature'

export default async function SignaturePage({ params }: { params: { id: string } }) {
  const isValid = await verifySignature(params.id)

  return (
    <div>
      <h1>Signature Verification</h1>
      <p>Signature is {isValid ? 'valid' : 'invalid'}</p>
    </div>
  )
}

*/