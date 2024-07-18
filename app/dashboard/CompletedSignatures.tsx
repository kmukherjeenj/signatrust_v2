'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import SkeletonLoader from '../client/components/SkeletonLoader'
import { agent } from '../lib/auth/authService'
import { VerifiableCredential, IAgent } from '@veramo/core'

type CredentialAndMetadata = {
  hash: string
  verifiableCredential: VerifiableCredential
}

interface SignatureStatus {
  id: string;
  documentName: string;
  signedAt: string;
  status: 'completed';
}

interface DocumentSignatureCredential extends VerifiableCredential {
  type: string[];
  credentialSubject: {
    documentName: string;
    [key: string]: any;
  };
}

// Type guard to check if the agent has the dataStoreORMGetVerifiableCredentials method
function hasDataStoreORM(agent: IAgent): agent is IAgent & { dataStoreORMGetVerifiableCredentials: () => Promise<CredentialAndMetadata[]> } {
  return 'dataStoreORMGetVerifiableCredentials' in agent;
}

// Type guard to check if a credential is a DocumentSignatureCredential
function isDocumentSignatureCredential(cred: VerifiableCredential): cred is DocumentSignatureCredential {
  return Array.isArray(cred.type) &&
         cred.type.includes('DocumentSignature') &&
         'credentialSubject' in cred &&
         typeof cred.credentialSubject === 'object' &&
         cred.credentialSubject !== null &&
         'documentName' in cred.credentialSubject;
}

const CompletedSignatures: React.FC = () => {
  const [completedSignatures, setCompletedSignatures] = useState<SignatureStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCompletedSignatures()
  }, [])

  const fetchCompletedSignatures = async () => {
    try {
      if (!hasDataStoreORM(agent)) {
        throw new Error('Agent does not support dataStoreORMGetVerifiableCredentials');
      }

      // Fetch all verifiable credentials
      const credentials = await agent.dataStoreORMGetVerifiableCredentials()
      
      // Filter and transform credentials to SignatureStatus
      const signatures: SignatureStatus[] = credentials
        .filter((cred): cred is CredentialAndMetadata & { verifiableCredential: DocumentSignatureCredential } => 
          isDocumentSignatureCredential(cred.verifiableCredential)
        )
        .map((cred) => ({
          id: cred.hash,
          documentName: cred.verifiableCredential.credentialSubject.documentName,
          signedAt: cred.verifiableCredential.issuanceDate,
          status: 'completed'
        }))

      setCompletedSignatures(signatures)
    } catch (err) {
      console.error('Error fetching completed signatures:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <SkeletonLoader />

  if (error) {
    return (
      <div className="text-red-500">
        Error: {error}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="completed-signatures bg-gray-800 p-6 rounded-lg shadow-lg"
    >
      <h2 className="text-2xl font-bold mb-4 text-white">Completed Signatures</h2>
      {completedSignatures.length === 0 ? (
        <p className="text-gray-400">No completed signatures yet.</p>
      ) : (
        <ul className="space-y-4">
          {completedSignatures.map((signature) => (
            <li key={signature.id} className="bg-gray-700 p-4 rounded-md">
              <h3 className="text-lg font-semibold text-white">{signature.documentName}</h3>
              <p className="text-gray-300">Signed on: {new Date(signature.signedAt).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  )
}

export default CompletedSignatures