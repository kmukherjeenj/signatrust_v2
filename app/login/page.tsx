/*"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { AuthKitProvider, SignInButton, useSignInMessage } from '@farcaster/auth-kit';

export default function Login() {
  const router = useRouter();

  const handleSuccess = (message: any) => {
    // Handle successful login
    console.log('Signed in:', message);
    router.push('/dashboard');
  };

  return (
    <AuthKitProvider>
      <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Sign in with Farcaster
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <SignInButton onSuccess={handleSuccess} />
          </div>
        </div>
      </div>
    </AuthKitProvider>
  );
}*/

"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

// Mock SignInButton component
const SignInButton = ({ onSuccess }: { onSuccess: (message: any) => void }) => (
  <button 
    onClick={() => onSuccess({ userId: '123', username: 'mockUser' })}
    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
  >
    Sign in with Farcaster
  </button>
);

export default function Login() {
  const router = useRouter();

  const handleSuccess = (message: any) => {
    // Handle successful login
    console.log('Signed in:', message);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Sign in with Farcaster
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <SignInButton onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
}