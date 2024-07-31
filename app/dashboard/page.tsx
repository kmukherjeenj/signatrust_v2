'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { User, File, Upload, Key, Send, CheckSquare, Clock, Search, LogOut, Menu } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import ErrorBoundary from '../components/ErrorBoundary';
import { log, logError } from '../utils/client_logger';
import api from '../lib/api';
import { useSearchParams } from 'next/navigation';
import { QuickActions } from '../components/Dashboard/QuickActions';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface UserData {
  did: string;
  name?: string;
  email?: string;
}

interface Document {
  id: string;
  name: string;
  status: 'pending' | 'signed' | 'expired';
  date: string;
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

const ErrorFallbackWrapper: React.FC = () => {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      setError(event.error);
    };

    window.addEventListener('error', errorHandler);

    return () => {
      window.removeEventListener('error', errorHandler);
    };
  }, []);

  if (error) {
    return <ErrorFallback error={error} />;
  }

  return null;
};

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
  //const did = searchParams.get('did');
  const did = searchParams.get('did') || sessionStorage.getItem('userDID'); 

  const fetchUserData = useCallback(async () => {
    if (!did) {
      logError(new Error('No DID provided'), 'Error fetching user data');
      return;
    }

    try {
      log('info', 'Fetching user data', { did });
      const response = await api.get(`/identity/${encodeURIComponent(did)}`);
      //const response = await api.get(`/${encodeURIComponent(did)}`); 
      const userData = response.data;

      setUser({
        did: userData.did,
        name: userData.name || 'Unknown',
        email: userData.email || undefined,
      });
      log('info', 'User data fetched successfully', { did: userData.did });

      // Fetch documents (mock data for now)
      setDocuments([
        { id: '1', name: 'Contract A', status: 'pending', date: '2024-07-18' },
        { id: '2', name: 'Agreement B', status: 'signed', date: '2024-07-17' },
        { id: '3', name: 'Proposal C', status: 'expired', date: '2024-07-16' },
      ]);
      log('info', 'Documents fetched', { count: 3 });
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), 'Error fetching user data');
      setUser(null);
    }
  }, [did]);

  useEffect(() => {
    log('info', 'Dashboard component mounted');
    //log('info', 'Dashboard mounted, DID sources', { didFromUrl, didFromSession });
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
      // Implement logout logic here
      sessionStorage.removeItem('userDID');
      router.push('/login');
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), 'Error during logout');
    }
  };

  const handleDocumentUploaded = (newDocument: Document) => {
    setDocuments(prevDocuments => [...prevDocuments, newDocument]);
  };

  const handleDocumentSent = () => {
    // Refresh documents list or show a success message
    log('info', 'Document sent for signature');
  };

  if (!user) {
    //return <LoadingFallback />;
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <header className="flex justify-between items-center py-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="/path/to/avatar.png" alt="User Avatar" />
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
                <div className="space-y-4">
                  {documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-800 rounded-lg">
                      <div className="flex items-center">
                        <File className="mr-2 h-4 w-4" />
                        <span>{doc.name}</span>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          doc.status === 'pending' ? 'bg-yellow-500' :
                          doc.status === 'signed' ? 'bg-green-500' :
                          'bg-red-500'
                        }`}>
                          {doc.status}
                        </span>
                        <span className="ml-2 text-sm text-gray-400">{doc.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <QuickActions
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
    <ErrorBoundary fallback={<ErrorFallbackWrapper />}>
      <Suspense fallback={<LoadingFallback />}>
        <DashboardContent />
      </Suspense>
    </ErrorBoundary>
  );
};

export default DashboardPage;