"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, File, Upload, Key } from 'lucide-react';

// Mock user data - replace with actual data fetching
const mockUser = {
  name: "John Doe",
  email: "john@example.com",
  farcasterID: "john_doe_123"
};

export default function Dashboard() {
  const [user, setUser] = useState(mockUser);
  const router = useRouter();

  useEffect(() => {
    // Fetch user data here
    // Example: fetchUserData().then(data => setUser(data));
  }, []);

  const handleLogout = () => {
    // Implement logout logic here
    router.push('/login');
  };

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
                  <span>{user.name}</span>
                </div>
                <div className="flex items-center mb-2">
                  <File className="mr-2" size={20} />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center">
                  <Key className="mr-2" size={20} />
                  <span>Farcaster ID: {user.farcasterID}</span>
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
                <li className="py-3">Document uploaded: &quot;Contract.pdf&quot;</li>
                <li className="py-3">Signature requested for: &quot;NDA.pdf&quot;</li>
                  <li className="py-3">Farcaster ID created</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}