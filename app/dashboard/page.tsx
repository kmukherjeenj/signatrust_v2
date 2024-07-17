"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, File, Upload, Key } from 'lucide-react';
import { agent } from '../lib/auth/authService';
import { IIdentifier } from '@veramo/core';

interface UserData {
  did: string;
  name?: string;
  email?: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const identifiers: IIdentifier[] = await agent.didManagerFind();
        if (identifiers.length > 0) {
          const identifier = identifiers[0]; // Assuming the first DID is the user's
          const userData: UserData = {
            did: identifier.did,
            name: identifier.alias || 'Unknown',
            email: identifier.alias ? `${identifier.alias}@example.com` : undefined,
          };
          setUser(userData);
        } else {
          // No DID found, user might not be logged in
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Handle error (e.g., show error message)
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleLogout = async () => {
    // Implement logout logic here
    // For example, clear the stored DID or session
    // await agent.didManagerDelete({ did: user.did });
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
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Info */}
            <div className="bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-xl font-semibold mb-4">User Information</h2>
                <div className="flex items-center mb-2">
                  <User className="mr-2" size={20} />
                  <span>{user.name || 'Unknown'}</span>
                </div>
                <div className="flex items-center mb-2">
                  <File className="mr-2" size={20} />
                  <span>{user.email || 'No email available'}</span>
                </div>
                <div className="flex items-center">
                  <Key className="mr-2" size={20} />
                  <span>DID: {user.did}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="space-y-4">
                  <Link href="/create-farcaster-id" className="flex items-center text-purple-400 hover:text-purple-300">
                    <Key className="mr-2" size={20} />
                    Create Farcaster ID
                  </Link>
                  <Link href="/upload-document" className="flex items-center text-purple-400 hover:text-purple-300">
                    <Upload className="mr-2" size={20} />
                    Upload Document
                  </Link>
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-gray-800 overflow-hidden shadow rounded-lg md:col-span-2">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
                <ul className="divide-y divide-gray-700">
                  <li className="py-3">DID created: {user.did}</li>
                  <li className="py-3">Login successful</li>
                  {/* Add more activities as needed */}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}