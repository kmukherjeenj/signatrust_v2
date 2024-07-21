'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createAccount } from '../lib/auth';
import { log, logError } from '../utils/client_logger';
import ErrorBoundary from '../components/ErrorBoundary';

interface UserData {
  username: string;
  email: string;
}

interface IdentityResponse {
  did: string;
  publicKey: string;
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState<UserData>({ username: '', email: '' });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [registrationComplete, setRegistrationComplete] = useState<boolean>(false);
  const [identity, setIdentity] = useState<IdentityResponse | null>(null);
  const router = useRouter();

  useEffect(() => {
    log('info', 'Register component mounted');
    return () => log('info', 'Register component unmounted');
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    log('info', 'Registration attempt', { username: formData.username, email: formData.email });

    try {
      const identityResponse = await createAccount(formData);
      log('info', 'Account created successfully', { did: identityResponse.did });
      setIdentity(identityResponse);
      setRegistrationComplete(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logError(error, 'Registration failed');
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (registrationComplete && identity) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">Registration Complete!</h2>
        <p className="mt-2 text-center text-sm text-gray-400">Your DID: {identity.did}</p>
        <p className="mt-2 text-center text-sm text-gray-400">Your Public Key: {identity.publicKey}</p>
        <p className="mt-2 text-center text-sm text-gray-400">Please save these securely. They will be used for future authentications.</p>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <button
            onClick={() => router.push('/login')}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">Create your account</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 bg-gray-700 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 bg-gray-700 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isLoading ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const RegisterPage: React.FC = () => (
  <ErrorBoundary fallback={<div>Something went wrong with the registration page. Please try refreshing.</div>}>
    <Register />
  </ErrorBoundary>
);

export default RegisterPage;