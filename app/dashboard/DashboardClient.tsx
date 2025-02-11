'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { log, logError } from '../utils/client_logger';
import { fetchUserData, getDocuments, getSignatureRequests, getPendingSignatures, signDocument } from '../lib/api';
import { Document, UserData, SignatureRequest } from '../shared/types';
import UserHeader from '../components/Dashboard/UserHeader';
import DocumentSection from '../components/Dashboard/DocumentSection';
import SignatureRequestSection from '../components/Dashboard/SignatureRequestSection';
import PendingSignaturesSection from '../components/Dashboard/PendingSignaturesSection';
import QuickActions from '../components/Dashboard/QuickActions';
import UserInfoCard from '../components/Dashboard/UserInfoCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const DashboardClient: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [pendingSignatures, setPendingSignatures] = useState<SignatureRequest[]>([]);
  const [signatureRequests, setSignatureRequests] = useState<SignatureRequest[]>([]);
  const [activeTab, setActiveTab] = useState('documents');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  const fetchData = useCallback(async (did: string) => {
    log('info', 'fetchData called', { did });
    if (!did) {
      logError(new Error('No DID provided'), 'Error fetching user data');
      setError('No DID provided. Please log in again.');
      setIsLoading(false);
      router.push('/login');
      return;
    }
    try {
      setIsLoading(true);
      log('info', 'Fetching user data', { did });
      
      const userData = await fetchUserData(did);
      setUser(userData);
      log('info', 'User data fetched successfully', userData);

      log('info', 'Fetching documents');
      const fetchedDocuments = await getDocuments();
      log('info', 'Documents fetched', { count: fetchedDocuments.length });

      log('info', 'Fetching signature requests');
      const fetchedSignatureRequests = await getSignatureRequests();
      log('info', 'Signature requests fetched', { count: fetchedSignatureRequests.length });

      log('info', 'Fetching pending signatures');
      const fetchedPendingSignatures = await getPendingSignatures();
      log('info', 'Pending signatures fetched', { count: fetchedPendingSignatures.length });

      setDocuments(fetchedDocuments);
      setSignatureRequests(fetchedSignatureRequests);
      setPendingSignatures(fetchedPendingSignatures);

      log('info', 'All data fetched successfully');
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), 'Error fetching data');
      setError('Failed to fetch data. Please try again.');
      setUser(null);
    } finally {
      setIsLoading(false);
      log('info', 'fetchData completed', { isLoading: false });
    }
  }, [router]);

  useEffect(() => {
    log('info', 'Dashboard component mounted');
    const didFromParams = searchParams.get('did');
    const didFromSession = sessionStorage.getItem('userDID');
    const currentDid = didFromParams || didFromSession;

    if (!currentDid) {
      log('info', 'No DID provided, redirecting to login');
      sessionStorage.setItem('intendedDestination', '/dashboard');
      router.push('/login');
    } else {
      log('info', 'DID found, calling fetchData', { did: currentDid });
      fetchData(currentDid);
    }
  }, [router, searchParams, fetchData]);

  const handleLogout = async () => {
    try {
      log('info', 'User logout initiated');
      sessionStorage.removeItem('userDID');
      router.push('/login');
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), 'Error during logout');
    }
  };

  const handleSign = async (documentId: string) => {
    try {
      await signDocument(documentId, "placeholder_signature_data");
      log('info', 'Document signed successfully', { documentId });
      const currentDid = sessionStorage.getItem('userDID');
      if (currentDid) {
        await fetchData(currentDid);
      } else {
        throw new Error('No DID found for refreshing data');
      }
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), 'Error signing document');
      alert('Failed to sign document. Please try again.');
    }
  };

  const handleSendForSignature = async (documentId: string, signers: string[]) => {
    // Implement the logic to send a document for signature
  };

  const handleUpload = async (newDocument: Document) => {
    setDocuments(prevDocuments => [...prevDocuments, newDocument]);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>No user data available.</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <UserHeader user={user} onLogout={handleLogout} />
        
        <Tabs defaultValue={activeTab} className="mt-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="signature-requests">Signature Requests</TabsTrigger>
            <TabsTrigger value="pending-signatures">Pending Signatures</TabsTrigger>
          </TabsList>
          <TabsContent value="documents">
            <DocumentSection documents={documents} onSign={handleSign} onSendForSignature={handleSendForSignature} />
          </TabsContent>
          <TabsContent value="signature-requests">
            <SignatureRequestSection requests={signatureRequests} />
          </TabsContent>
          <TabsContent value="pending-signatures">
            <PendingSignaturesSection requests={pendingSignatures} onSign={handleSign} />
          </TabsContent>
        </Tabs>
        
        <QuickActions
          onUpload={handleUpload}
          onSend={handleSendForSignature}
          onViewPending={() => setActiveTab('pending-signatures')}
          onCheckStatus={() => {/* Implement status checking logic */}}
          //onDocumentUploaded={handleUpload}
        />
        
        <UserInfoCard user={user} />
      </div>
    </div>
  );
};

export default DashboardClient;