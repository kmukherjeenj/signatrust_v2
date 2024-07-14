/*'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getSignatureStatus, signDocument } from '../../services/farcasterAPI'
import { SignatureStatus } from '../../services/farcasterTypes'
import SignaturePad from '../../components/SignaturePad'
import SkeletonLoader from '../../components/SkeletonLoader'


const PendingSignatures: React.FC = () => {
  const [pendingSignatures, setPendingSignatures] = useState<SignatureStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSignature, setCurrentSignature] = useState<null | { id: string; documentName: string }>(null)

  useEffect(() => {
    fetchPendingSignatures()
  }, [])

  const fetchPendingSignatures = async () => {
    try {
      // Adjusted this part to fetch all pending signatures correctly
      const signatureIds = ['pendingId1', 'pendingId2'] // Example IDs, replace with real logic to get pending IDs
      const signatures: SignatureStatus[] = await Promise.all(
        signatureIds.map(id => getSignatureStatus(id))
      )
      setPendingSignatures(signatures)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching pending signatures:', error)
      setLoading(false)
    }
  }

  const handleSign = (signature: { id: string; documentName: string }) => {
    setCurrentSignature(signature)
  }

  const handleSignatureComplete = async (signatureData: string) => {
    try {
      if (currentSignature) {
        await signDocument(currentSignature.id, signatureData)
        setCurrentSignature(null)
        fetchPendingSignatures()
      }
    } catch (error) {
      console.error('Error signing document:', error)
      alert('Failed to sign document. Please try again.')
    }
  }

  if (loading) return <SkeletonLoader />

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pending-signatures"
    >
      <h1>Pending Signatures</h1>
      {currentSignature ? (
        <div>
          <h2>Sign Document: {currentSignature.documentName}</h2>
          <SignaturePad onComplete={handleSignatureComplete} />
        </div>
      ) : (
        <ul>
          {pendingSignatures.map((signature) => (
            <li key={signature.id}>
              <span>{signature.documentName}</span>
              <button onClick={() => handleSign(signature)}>Sign</button>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  )
}

export default PendingSignatures
*/

'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
// import { getSignatureStatus, signDocument } from '../../services/farcasterAPI'
// import { SignatureStatus } from '../../services/farcasterTypes'
import SignaturePad from '../../components/SignaturePad'
import SkeletonLoader from '../../components/SkeletonLoader'

// Mock SignatureStatus type
interface MockSignatureStatus {
  id: string;
  documentName: string;
  status: 'pending' | 'completed';
}

const PendingSignatures: React.FC = () => {
  const [pendingSignatures, setPendingSignatures] = useState<MockSignatureStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSignature, setCurrentSignature] = useState<null | { id: string; documentName: string }>(null)

  useEffect(() => {
    fetchPendingSignatures()
  }, [])

  const fetchPendingSignatures = async () => {
    // Simulate API call
    setTimeout(() => {
      const mockSignatures: MockSignatureStatus[] = [
        { id: 'pendingId1', documentName: 'Document A', status: 'pending' },
        { id: 'pendingId2', documentName: 'Document B', status: 'pending' },
      ]
      setPendingSignatures(mockSignatures)
      setLoading(false)
    }, 1000)
  }

  const handleSign = (signature: { id: string; documentName: string }) => {
    setCurrentSignature(signature)
  }

  const handleSignatureComplete = async (signatureData: string) => {
    try {
      if (currentSignature) {
        // Simulate signing process
        console.log(`Signing document ${currentSignature.id} with data: ${signatureData}`)
        setCurrentSignature(null)
        // Remove the signed document from pending signatures
        setPendingSignatures(prev => prev.filter(sig => sig.id !== currentSignature.id))
      }
    } catch (error) {
      console.error('Error signing document:', error)
      alert('Failed to sign document. Please try again.')
    }
  }

  if (loading) return <SkeletonLoader />

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pending-signatures"
    >
      <h1>Pending Signatures</h1>
      {currentSignature ? (
        <div>
          <h2>Sign Document: {currentSignature.documentName}</h2>
          <SignaturePad onComplete={handleSignatureComplete} signatureRequestId={currentSignature.id} />
        </div>
      ) : (
        <ul>
          {pendingSignatures.map((signature) => (
            <li key={signature.id}>
              <span>{signature.documentName}</span>
              <button onClick={() => handleSign(signature)}>Sign</button>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  )
}

export default PendingSignatures