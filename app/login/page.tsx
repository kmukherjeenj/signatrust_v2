'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { agent } from '../services/authService';
import { IIdentifier } from '@veramo/core';

export default function Login() {
  const router = useRouter();
  const [did, setDid] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const identifier: IIdentifier | undefined = await agent.didManagerGet({ did });

      if (!identifier) {
        throw new Error('DID not found');
      }

      console.log('Logged in with DID:', identifier.did);
      setIsLoading(false);
      router.push('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please check your DID and try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Sign in with your DID
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="did" className="block text-sm font-medium text-gray-300">
                Decentralized Identifier (DID)
              </label>
              <div className="mt-1">
                <input
                  id="did"
                  name="did"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-700 text-white"
                  value={did}
                  onChange={(e) => setDid(e.target.value)}
                  placeholder="did:ethr:goerli:..."
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm mt-2">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}