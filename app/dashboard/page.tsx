// app/dashboard/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, File, Upload, Key, Send, CheckSquare, Clock, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import ErrorBoundary from '../components/ErrorBoundary';
import { log, logError } from '../utils/client_logger';
import api from '../lib/api';

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

const DashboardPage: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const router = useRouter();

  const fetchUserData = useCallback(async () => {
    try {
      log('info', 'Fetching user data');
      const response = await api.get('/api/user'); // Fetch user data from backend
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
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    log('info', 'Dashboard component mounted');
    fetchUserData();
    return () => log('info', 'Dashboard component unmounted');
  }, [fetchUserData]);

  const handleLogout = async () => {
    try {
      log('info', 'User logout initiated');
      // Implement logout logic here
      router.push('/login');
    } catch (error) {
      logError(error instanceof Error ? error : new Error(String(error)), 'Error during logout');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">No user data available</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <header className="flex justify-between items-center py-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Button onClick={handleLogout}>Logout</Button>
        </header>
        <section className="mt-8">
          <Card>
            <CardHeader>
              <Avatar>
                <AvatarImage src="/path/to/avatar.png" alt="User Avatar" />
                <AvatarFallback>{user.name ? user.name.charAt(0) : 'U'}</AvatarFallback>
              </Avatar>
              <CardTitle>{user.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>DID: {user.did}</p>
              <p>Email: {user.email}</p>
            </CardContent>
          </Card>
        </section>
        <section className="mt-8">
          <h2 className="text-xl font-bold">Documents</h2>
          <div className="mt-4 grid grid-cols-1 gap-4">
            {documents.map(doc => (
              <Card key={doc.id}>
                <CardHeader>
                  <CardTitle>{doc.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Status: {doc.status}</p>
                  <p>Date: {doc.date}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
