'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { agent } from '../lib/auth/authService';
import Link from 'next/link';

const InfoCard = ({ title, description }: { title: string; description: string }) => (
  <div className="flex-shrink-0 w-64 bg-gray-800 p-4 rounded-lg shadow-md mr-4">
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-sm text-gray-400">{description}</p>
  </div>
);

export default function Login() {
  const router = useRouter();
  const [did, setDid] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollContainer = useRef<HTMLDivElement>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const identifier = await agent.didManagerGet({ did });

      if (!identifier) {
        throw new Error('DID not found');
      }

      console.log('Logged in with DID:', identifier.did);
      setIsLoading(false);
      router.push('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('Oops! We couldn\'t find your digital ID. Please double-check and try again.');
      setIsLoading(false);
    }
  };

  const scroll = (scrollOffset: number) => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollLeft += scrollOffset;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Welcome Back!
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Sign in with your unique digital ID
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="did" className="block text-sm font-medium text-gray-300">
                Your Digital ID
              </label>
              <div className="mt-1">
                <input
                  id="did"
                  name="did"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={did}
                  onChange={(e) => setDid(e.target.value)}
                  placeholder="Enter your digital ID here"
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
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                {isLoading ? 'Signing you in...' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">
                  New to our service?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/register"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-purple-600 bg-purple-100 hover:bg-purple-200"
              >
                Create Your Digital ID
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium text-white mb-4">Why Use a Digital ID?</h3>
          <div className="relative">
            <div 
              ref={scrollContainer}
              className="flex overflow-x-auto pb-4 hide-scrollbar"
              style={{ scrollBehavior: 'smooth' }}
            >
              <InfoCard 
                title="Your Online Passport" 
                description="A super-secure digital identity that's uniquely yours."
              />
              <InfoCard 
                title="You're in Control" 
                description="No company owns your identity. You decide what to share."
              />
              <InfoCard 
                title="One ID, Many Services" 
                description="Use it across different platforms without creating new accounts."
              />
              <InfoCard 
                title="Privacy First" 
                description="Your personal info stays private. Share only what you want."
              />
              <InfoCard 
                title="Future-Proof" 
                description="Works with the latest online security standards."
              />
            </div>
            <button 
              onClick={() => scroll(-280)} 
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-800 rounded-full p-2 shadow-md"
            >
              ←
            </button>
            <button 
              onClick={() => scroll(280)} 
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 rounded-full p-2 shadow-md"
            >
              →
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link href="/learn-more" className="text-sm font-medium text-purple-400 hover:text-purple-300">
            Learn more about Digital IDs
          </Link>
        </div>
      </div>
    </div>
  );
}