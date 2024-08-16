'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getPendingSignatures, signDocument } from '../../lib/api'
import { SignatureRequest, Document } from '../../shared/types'
import SignatureRequestList from '../../components/SignatureRequestList'
import { Button } from '../../components/ui/button'
import { Card, CardHeader, CardContent, CardTitle } from '../../components/ui/card'
import { log, logError } from '../../utils/client_logger'

const PendingSignatures: React.FC = () => {
  const [pendingSignatures, setPendingSignatures] = useState<SignatureRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSignature, setCurrentSignature] = useState<SignatureRequest | null>(null)

  useEffect(() => {
    fetchPendingSignatures()
  }, [])

  const fetchPendingSignatures = async () => {
    try {
      setLoading(true)
      const signatures = await getPendingSignatures()
      setPendingSignatures(signatures)
      log('info', 'Fetched pending signatures', { count: signatures.length })
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), 'Error fetching pending signatures')
    } finally {
      setLoading(false)
    }
  }

  const handleSign = (signature: SignatureRequest) => {
    setCurrentSignature(signature)
  }

  const handleSignatureComplete = async (signatureId: string) => {
    try {
      if (currentSignature && currentSignature.id === signatureId) {
        // In a real implementation, you'd capture the signature data here
        const signatureData = "placeholder_signature_data";
        await signDocument(signatureId, signatureData)
        log('info', 'Document signed successfully', { documentId: signatureId })
        setCurrentSignature(null)
        // Refresh the list of pending signatures
        await fetchPendingSignatures()
      }
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), 'Error signing document')
      alert('Failed to sign document. Please try again.')
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pending-signatures"
    >
      <h1 className="text-2xl font-bold mb-6">Pending Signatures</h1>
      {currentSignature ? (
        <Card>
          <CardHeader>
            <CardTitle>Sign Document: {currentSignature.documentName}</CardTitle>
          </CardHeader>
          <CardContent>
            <SignatureRequestList
              requests={[currentSignature]}
            />
            <Button onClick={() => handleSignatureComplete(currentSignature.id)}>
              Sign Document
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Documents Awaiting Your Signature</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingSignatures.length > 0 ? (
              <>
                <SignatureRequestList
                  requests={pendingSignatures}
                />
                <ul className="mt-4 space-y-2">
                  {pendingSignatures.map(signature => (
                    <li key={signature.id}>
                      <Button onClick={() => handleSign(signature)}>
                        Sign {signature.documentName}
                      </Button>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p>No pending signatures at the moment.</p>
            )}
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}

export default PendingSignatures