"use client";

import React, { useState, useEffect } from 'react';
import { User, File, Upload, Key, Send, CheckSquare, Clock, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { agent } from '../lib/auth/authService';
import { IIdentifier } from '@veramo/core';
import { Button } from "../client/components/ui/button";
import { Input } from "../client/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "../client/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../client/components/ui/avatar";

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

export default function Dashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const identifiers: IIdentifier[] = await agent.didManagerFind();
        if (identifiers.length > 0) {
          const identifier = identifiers[0];
          setUser({
            did: identifier.did,
            name: identifier.alias || 'Unknown',
            email: identifier.alias ? `${identifier.alias}@example.com` : undefined,
          });
          // Fetch documents (mock data for now)
          setDocuments([
            { id: '1', name: 'Contract A', status: 'pending', date: '2024-07-18' },
            { id: '2', name: 'Agreement B', status: 'signed', date: '2024-07-17' },
            { id: '3', name: 'Proposal C', status: 'expired', date: '2024-07-16' },
          ]);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleLogout = async () => {
    // Implement logout logic here
    router.push('/login');
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">No user data available</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold">SignaTrust Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={`https://avatar.vercel.sh/${user.name}`} />
              <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <Button variant="destructive" onClick={handleLogout}>Logout</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Document Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4">
                <Input 
                  className="w-2/3" 
                  placeholder="Search documents..." 
                  type="search"
                  icon={<Search className="text-gray-400" size={18} />}
                />
                <Button>
                  <Upload className="mr-2" size={18} />
                  Upload New Document
                </Button>
              </div>
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center">
                      <File className="mr-2" size={20} />
                      <span>{doc.name}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        doc.status === 'pending' ? 'bg-yellow-600' :
                        doc.status === 'signed' ? 'bg-green-600' : 'bg-red-600'
                      }`}>
                        {doc.status}
                      </span>
                      <span className="text-sm text-gray-400">{doc.date}</span>
                      <Button variant="outline" size="sm">
                        <Send className="mr-2" size={16} />
                        Send for Signature
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <User className="mr-2" size={20} />
                    <span>{user.name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center">
                    <File className="mr-2" size={20} />
                    <span>{user.email || 'No email available'}</span>
                  </div>
                  <div className="flex items-center">
                    <Key className="mr-2" size={20} />
                    <span className="text-sm truncate" title={user.did}>DID: {user.did}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button className="w-full justify-start">
                    <Upload className="mr-2" size={18} />
                    Upload New Document
                  </Button>
                  <Button className="w-full justify-start">
                    <Send className="mr-2" size={18} />
                    Send Document for Signature
                  </Button>
                  <Button className="w-full justify-start">
                    <CheckSquare className="mr-2" size={18} />
                    View Pending Signatures
                  </Button>
                  <Button className="w-full justify-start">
                    <Clock className="mr-2" size={18} />
                    Check Document Status
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}