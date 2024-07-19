// app/components/Dashboard.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { User, File, Upload, Key, Send, CheckSquare, Clock, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { agent } from '../../lib/auth/authService';
import { IIdentifier } from '@veramo/core';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import ErrorBoundary from './ErrorBoundary';
import { log, logError } from '../utils/client_logger';

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
  
  const Dashboard: React.FC = () => {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [documents, setDocuments] = useState<Document[]>([]);
    const router = useRouter();
  
    const fetchUserData = useCallback(async () => {
      try {
        log('info', 'Fetching user data');
        const identifiers: IIdentifier[] = await agent.didManagerFind();
        if (identifiers.length > 0) {
          const identifier = identifiers[0];
          setUser({
            did: identifier.did,
            name: identifier.alias || 'Unknown',
            email: identifier.alias ? `${identifier.alias}@example.com` : undefined,
          });
          log('info', 'User data fetched successfully', { did: identifier.did });
          
          // Fetch documents (mock data for now)
          setDocuments([
            { id: '1', name: 'Contract A', status: 'pending', date: '2024-07-18' },
            { id: '2', name: 'Agreement B', status: 'signed', date: '2024-07-17' },
            { id: '3', name: 'Proposal C', status: 'expired', date: '2024-07-16' },
          ]);
          log('info', 'Documents fetched', { count: 3 });
        } else {
          log('warn', 'No user identifiers found');
          router.push('/login');
        }
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)), 'Error fetching user data');
        setUser(null);
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
        {/* ... (rest of the JSX remains the same) ... */}
      </div>
    );
  };
  
  export default Dashboard;