// File: app/dashboard/DashboardClient.tsx

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, File, LogOut, Menu, Upload, Send, Clock, FileCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { log, logError } from '../utils/client_logger';
import { getDocuments, uploadDocument, createSignatureRequest, getSignatureRequests } from '../lib/api';
import DocumentList from '../components/Dashboard/DocumentList';
import SignatureRequestList from '../components/SignatureRequestList';
import { Document, UserData, SignatureRequest } from '../shared/types';

const DashboardClient: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [storageProvider, setStorageProvider] = useState('cloud');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [signatureRequests, setSignatureRequests] = useState<SignatureRequest[]>([]);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const did = searchParams.get('did') || sessionStorage.getItem('userDID');

  const fetchSignatureRequests = useCallback(async () => {
    try {
      const requests = await getSignatureRequests();
      setSignatureRequests(requests);
      log('info', 'Signature requests fetched', { count: requests.length });
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), 'Error fetching signature requests');
    }
  }, []);
  
  const fetchUserData = useCallback(async () => {
    if (!did) {
      logError(new Error('No DID provided'), 'Error fetching user data');
      return;
    }

    try {
      log('info', 'Fetching user data', { did });
      // Replace this with actual API call when ready
      setUser({
        did: did,
        name: 'Kushal Mukherjee',
        email: 'kushal.mukherjee@example.com',
      });
      log('info', 'User data fetched successfully', { did });

      const fetchedDocuments = await getDocuments();
      setDocuments(fetchedDocuments);
      log('info', 'Documents fetched', { count: fetchedDocuments.length });
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), 'Error fetching user data');
      setUser(null);
    }
  }, [did]);

  useEffect(() => {
    log('info', 'Dashboard component mounted');
    if (!did) {
      log('info', 'No DID provided, redirecting to login');
      sessionStorage.setItem('intendedDestination', '/dashboard');
      router.push('/login');
    } else {
      fetchUserData();
      fetchSignatureRequests();
    }
    return () => log('info', 'Dashboard component unmounted');
  }, [fetchUserData, fetchSignatureRequests, did, router]);

  const handleLogout = async () => {
    try {
      log('info', 'User logout initiated');
      sessionStorage.removeItem('userDID');
      router.push('/login');
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), 'Error during logout');
    }
  };

  const handleSign = (documentId: string) => {
    router.push(`/documents/${documentId}/sign`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('storageProvider', storageProvider);
      const result = await uploadDocument(formData);
      setDocuments(prevDocuments => [...prevDocuments, result]);
      alert('Document uploaded successfully!');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDocumentSent = async (documentId?: string) => {
    try {
      let signers: string[];
      let selectedDocId: string;

      if (!documentId) {
        const docId = prompt('Enter document ID:');
        if (!docId) return;
        selectedDocId = docId;
      } else {
        selectedDocId = documentId;
      }

      const signersInput = prompt('Enter signer emails (comma-separated):');
      if (!signersInput) return;
      signers = signersInput.split(',').map(s => s.trim());

      log('info', 'Sending document for signature', { documentId: selectedDocId, signers });

      const newRequest = await createSignatureRequest(selectedDocId, signers);
      setSignatureRequests(prev => [...prev, newRequest]);

      log('info', 'Signature request created successfully');
      alert('Signature request sent successfully!');

    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), 'Error creating signature request');
      alert('Failed to send signature request. Please try again.');
    }
  };

  const handleViewPending = () => {
    router.push('/pending-signatures');
  };

  const handleCheckStatus = () => {
    log('info', 'Checking document status');
    // Implement status checking logic here
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <header className="flex justify-between items-center py-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="/images/default-avatar.png" alt={`${user.name}'s avatar`} />
              <AvatarFallback>{user.name ? user.name.charAt(0) : 'U'}</AvatarFallback>
            </Avatar>
            <span className="hidden md:inline">{user.name}</span>
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription>
                    <Button onClick={handleLogout} className="w-full mt-4">
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                    </Button>
                  </SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>
            <Button onClick={handleLogout} className="hidden md:flex">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </header>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <DocumentList 
                  documents={documents} 
                  onSign={handleSign} 
                  onSendForSignature={handleDocumentSent}
                />
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Signature Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <SignatureRequestList requests={signatureRequests} />
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    ref={fileInputRef}
                  />
                  <select
                    value={storageProvider}
                    onChange={(e) => setStorageProvider(e.target.value)}
                    className="mb-2 w-full p-2 bg-gray-700 text-white rounded"
                  >
                    <option value="cloud">Cloud Storage</option>
                    <option value="google">Google Drive</option>
                    <option value="azure">Azure Cloud Drive</option>
                    <option value="aws">AWS S3 Bucket</option>
                  </select>
                  <Button 
                    onClick={() => fileInputRef.current?.click()} 
                    className="w-full flex justify-center items-center"
                    disabled={isUploading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {isUploading ? 'Uploading...' : 'Upload New Document'}
                  </Button>
                  {file && (
                    <Button 
                      onClick={handleUpload} 
                      className="w-full mt-2 bg-green-500"
                      disabled={isUploading}
                    >
                      Confirm Upload
                    </Button>
                  )}
                </div>
                <Button 
                  onClick={() => {
                    const documentId = prompt('Enter document ID:');
                    const signersInput = prompt('Enter signer emails (comma-separated):');
                    if (documentId && signersInput) {
                      const signers = signersInput.split(',').map(s => s.trim());
                      handleDocumentSent(documentId);
                    }
                  }} 
                  className="w-full flex justify-center items-center"
                >
                  <Send className="mr-2 h-4 w-4" /> Send for Signature
                </Button>
                <Button onClick={handleViewPending} className="w-full flex justify-center items-center">
                  <Clock className="mr-2 h-4 w-4" /> View Pending Signatures
                </Button>
                <Button onClick={handleCheckStatus} className="w-full flex justify-center items-center">
                  <FileCheck className="mr-2 h-4 w-4" /> Check Document Status
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <section className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Name: {user.name}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-mono text-sm">DID: {user.did}</span>
                </div>
                {user.email && (
                  <div className="flex items-center">
                    <span>Email: {user.email}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default DashboardClient;