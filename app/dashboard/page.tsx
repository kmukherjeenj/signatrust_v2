'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams  } from 'next/navigation';
import { User, File, LogOut, Menu } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import ErrorBoundary from '../components/ErrorBoundary';
import { log, logError } from '../utils/client_logger';
import { getDocuments } from '../lib/api';
import { QuickActions } from '../components/Dashboard/QuickActions';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../../components/ui/sheet';
import DocumentList from '../components/Dashboard/DocumentList';
import { Document } from '../shared/types';
import api from '../lib/api';

interface UserData {
  did: string;
  name?: string;
  email?: string;
}

const ErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
  <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
    <h2 className="text-2xl font-bold mb-4">Oops! Something went wrong.</h2>
    <p className="text-red-400">{error.message}</p>
    <Button onClick={() => window.location.reload()} className="mt-4">
      Refresh Page
    </Button>
  </div>
);

const LoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
    Loading...
  </div>
);

const DashboardContent: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const did = searchParams.get('did') || sessionStorage.getItem('userDID');

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
        name: 'John Doe',
        email: 'john@example.com',
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
    }
    return () => log('info', 'Dashboard component unmounted');
  }, [fetchUserData, did, router]);

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

  const handleDocumentUploaded = (newDocument: Document) => {
    setDocuments(prevDocuments => [...prevDocuments, newDocument]);
  };

  const handleDocumentSent = () => {
    log('info', 'Document sent for signature');
  };

  const handleUpload = () => {
    router.push('/upload-document');
  };

  const handleViewPending = () => {
    router.push('/pending-signatures');
  };

  const handleCheckStatus = () => {
    // Implement check status logic here
    log('info', 'Checking document status');
  };

  if (!user) {
    return <LoadingFallback />;
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
                <DocumentList documents={documents} onSign={handleSign} />
              </CardContent>
            </Card>
          </div>
          
          <div>
            <QuickActions
              onUpload={handleUpload}
              onSend={handleDocumentSent}
              onViewPending={handleViewPending}
              onCheckStatus={handleCheckStatus}
              onDocumentUploaded={handleDocumentUploaded}
              onDocumentSent={handleDocumentSent}
            />
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

const DashboardPage: React.FC = () => {
  return (
    <ErrorBoundary
    fallback={
      <ErrorFallback error={new Error("An unexpected error occurred.")} />
    }
  >
      <Suspense fallback={<LoadingFallback />}>
        <DashboardContent />
      </Suspense>
    </ErrorBoundary>
  );
};

export default DashboardPage;