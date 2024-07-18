/*'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
//import { getSignatureStatus } from '@/services'
import { getSignatureStatus } from '@/services/farcasterAPI'
//import { getSignatureStatus } from '@/app/services/farcasterAPI';
import { SignatureStatus } from '@/services/farcasterTypes'
import { SkeletonLoader } from '@/components'

const CompletedSignatures: React.FC = () => {
  const [completedSignatures, setCompletedSignatures] = useState<SignatureStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCompletedSignatures()
  }, [])

  const fetchCompletedSignatures = async () => {
    try {
      // Adjusted this part to fetch all completed signatures correctly
      const signatureIds = ['completedId1', 'completedId2'] // Example IDs, replace with real logic to get completed IDs
      const signatures: SignatureStatus[] = await Promise.all(
        signatureIds.map(id => getSignatureStatus(id))
      )
      setCompletedSignatures(signatures)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching completed signatures:', error)
      setLoading(false)
    }
  }

  if (loading) return <SkeletonLoader />

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="completed-signatures"
    >
      <h1>Completed Signatures</h1>
      <ul>
        {completedSignatures.map((signature) => (
          <li key={signature.id}>
            <span>{signature.documentName}</span>
            <span>Signed on: {new Date(signature.signedAt).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

export default CompletedSignatures  */

'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
// import { getSignatureStatus } from '../../../services/farcasterAPI'
// import { SignatureStatus } from '../../../services/farcasterTypes'
import SkeletonLoader from '../../../client/components/SkeletonLoader'

// Mock SignatureStatus type
interface MockSignatureStatus {
  id: string;
  documentName: string;
  signedAt: string;
  status: 'completed';
}

const CompletedSignatures: React.FC = () => {
  const [completedSignatures, setCompletedSignatures] = useState<MockSignatureStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCompletedSignatures()
  }, [])

  const fetchCompletedSignatures = async () => {
    try {
      // Simulated API call with mock data
      setTimeout(() => {
        const mockSignatures: MockSignatureStatus[] = [
          { 
            id: 'completedId1', 
            documentName: 'Document A', 
            signedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            status: 'completed' 
          },
          { 
            id: 'completedId2', 
            documentName: 'Document B', 
            signedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            status: 'completed' 
          },
        ]
        setCompletedSignatures(mockSignatures)
        setLoading(false)
      }, 1000) // Simulate 1 second delay
    } catch (error) {
      console.error('Error fetching completed signatures:', error)
      setLoading(false)
    }
  }

  if (loading) return <SkeletonLoader />

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="completed-signatures"
    >
      <h1>Completed Signatures</h1>
      <ul>
        {completedSignatures.map((signature) => (
          <li key={signature.id}>
            <span>{signature.documentName}</span>
            <span>Signed on: {new Date(signature.signedAt).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

export default CompletedSignatures
