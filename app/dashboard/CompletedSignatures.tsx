/*'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getSignatureStatus } from '../services/farcasterAPI'
import { SignatureStatus } from '../services/farcasterTypes'
import SkeletonLoader from '../components/SkeletonLoader'

const CompletedSignatures: React.FC = () => {
  const [completedSignatures, setCompletedSignatures] = useState<SignatureStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCompletedSignatures()
  }, [])

  const fetchCompletedSignatures = async () => {
    try {
      // TODO: Replace with real logic to get completed signature IDs
      const signatureIds = ['completedId1', 'completedId2']
      const signatures: SignatureStatus[] = await Promise.all(
        signatureIds.map(id => getSignatureStatus(id))
      )
      setCompletedSignatures(signatures)
    } catch (error) {
      console.error('Error fetching completed signatures:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <SkeletonLoader />

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

export default CompletedSignatures */

'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import SkeletonLoader from '../components/SkeletonLoader'

// Define a mock signature status type
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
    fetchMockCompletedSignatures()
  }, [])

  const fetchMockCompletedSignatures = async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    const mockSignatures: MockSignatureStatus[] = [
      {
        id: 'completedId1',
        documentName: 'Contract A',
        signedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        status: 'completed'
      },
      {
        id: 'completedId2',
        documentName: 'Agreement B',
        signedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        status: 'completed'
      }
    ]

    setCompletedSignatures(mockSignatures)
    setLoading(false)
  }

  if (loading) return <SkeletonLoader />

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