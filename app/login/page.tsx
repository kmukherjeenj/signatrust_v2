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
      setError("Oops! We couldn't find your digital ID. Please double-check and try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
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

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <h3 className="text-xl font-bold text-white mb-4">Benefits of Decentralized Identity (DID)</h3>
          <ul className="list-disc pl-5 text-gray-300 space-y-2">
            <li>You own and control your identity, not corporations or governments</li>
            <li>Enhanced privacy: share only the information you choose</li>
            <li>Portable across different services and platforms</li>
            <li>Reduces the risk of identity theft and fraud</li>
            <li>Enables seamless, secure digital interactions</li>
          </ul>

          <h3 className="text-xl font-bold text-white mt-6 mb-4">Protecting Your DID</h3>
          <ul className="list-disc pl-5 text-gray-300 space-y-2">
            <li>Keep your private keys secure and never share them</li>
            <li>Use strong, unique passwords for any associated accounts</li>
            <li>Be cautious of phishing attempts asking for your DID information</li>
            <li>Regularly update and patch your devices and software</li>
            <li>Use multi-factor authentication whenever possible</li>
          </ul>

          <h3 className="text-xl font-bold text-white mt-6 mb-4">Recovering Your DID</h3>
          <ul className="list-disc pl-5 text-gray-300 space-y-2">
            <li>Set up a recovery method when creating your DID (e.g., trusted contacts, backup phrases)</li>
            <li>Store recovery information securely, preferably offline</li>
            <li>Consider using a DID method that supports social recovery</li>
            <li>Regularly review and update your recovery options</li>
            <li>In case of loss, contact your DID provider or use your established recovery method immediately</li>
          </ul>

          <p className="mt-6 text-gray-300">
            Remember, your DID is the key to your digital identity. Treat it with the same care and security as you would your physical identification documents.
          </p>
        </div>
      </div>
    </div>
  );
}