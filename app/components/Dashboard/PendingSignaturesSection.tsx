'use client'

import React, { useState, useEffect } from 'react';
import { getSignatureRequests, signDocument, fetchUserData } from '../../lib/api';
import { SignatureRequest, UserData } from '../../shared/types';
import { Button } from '../ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/card';
import { log, logError } from '../../utils/client_logger';

interface PendingSignaturesSectionProps {
  requests: SignatureRequest[];
  onSign: (documentId: string) => void;
}

const PendingSignaturesSection: React.FC<PendingSignaturesSectionProps> = ({ requests, onSign }) => {
  const [pendingSignatures, setPendingSignatures] = useState<SignatureRequest[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSignature, setCurrentSignature] = useState<SignatureRequest | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [signatures, user] = await Promise.all([getSignatureRequests(), fetchUserData('placeholder_did')]);
      setPendingSignatures(signatures.filter(sig => sig.status === 'pending'));
      setUserData(user);
      log('info', 'Fetched pending signatures and user data', { count: signatures.length });
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleSign = (signature: SignatureRequest) => {
    setCurrentSignature(signature);
    onSign(signature.documentId);
  };

  const handleSignatureComplete = async (signatureId: string) => {
    try {
      if (currentSignature && currentSignature.id === signatureId) {
        // In a real implementation, you'd capture the signature data here
        const signatureData = "placeholder_signature_data";
        await signDocument(signatureId, signatureData);
        log('info', 'Document signed successfully', { documentId: signatureId });
        setCurrentSignature(null);
        // Refresh the list of pending signatures
        await fetchData();
      }
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), 'Error signing document');
      alert('Failed to sign document. Please try again.');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Signatures</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {requests.map((request) => (
            <li key={request.id} className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Document: {request.documentName}</h3>
                  <p className="text-sm text-gray-400">Status: {request.status}</p>
                  <p className="text-sm text-gray-400">Signers: {request.signers.join(', ')}</p>
                </div>
                <Button onClick={() => onSign(request.documentId)}>Sign</Button>
              </div>
            </li>
          ))}
        </ul>
        {requests.length === 0 && (
          <p>No pending signatures at the moment.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingSignaturesSection;