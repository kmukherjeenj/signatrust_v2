'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { log, logError } from '../utils/client_logger';
import api from '../lib/api';
import axios from 'axios';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [did, setDid] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    log('info', 'Login component mounted');
    return () => log('info', 'Login component unmounted');
  }, []);

  const isDIDValid = (did: string) => {
    // Basic DID validation logic
    return /^did:[\w:]+$/.test(did);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    log('info', 'Login attempt', { did });

    if (!did.trim()) {
      setError("DID cannot be empty.");
      setIsLoading(false);
      return;
    }

    if (!isDIDValid(did)) {
      setError("Invalid DID format. Please enter a valid DID.");
      setIsLoading(false);
      return;
    }

    try {
      log('info', 'Sending login request to backend', { did });
      //const response = await api.post('/api/login', { did });
      //const response = await api.post('/identity/login', { did });
      const response = await api.post('/identity/login', { did }, { withCredentials: true });
      
      if (response.data && response.data.identity && response.data.identity.did) {
        const matchingIdentifier = response.data.identity;
        log('info', 'Logged in successfully', { did: matchingIdentifier.did });
        setIsLoading(false);
        //router.push(`/dashboard`);
        router.push(`/dashboard?did=${encodeURIComponent(matchingIdentifier.did)}`);
      } else {
        throw new Error('Login successful but DID not returned');
      }
      //const matchingIdentifier = response.data;
      //if (matchingIdentifier && matchingIdentifier.did) {
      //  log('info', 'Logged in successfully', { did: matchingIdentifier.did });
        // Remove this line as we're no longer storing the DID in sessionStorage
        // sessionStorage.setItem('userDID', matchingIdentifier.did);
      //  setIsLoading(false);
        //router.push(`/dashboard?did=${encodeURIComponent(matchingIdentifier.did)}`);
      //  router.push(`/dashboard`);
      //} else {
      //  throw new Error('Login successful but DID not returned');
      //}
      //localStorage.setItem('authToken', token);
      //localStorage.setItem('userDID', returnedDid);
      //log('info', 'Logged in successfully', { did: matchingIdentifier.did });
      //setIsLoading(false);
      //router.push('/dashboard');
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        switch (err.response?.status) {
          case 400:
            setError("Invalid request. Please check your input and try again.");
            break;
          case 401:
            setError("Authentication failed. Please check your DID and try again.");
            break;
          case 404:
            setError("Digital ID not found. Please check and try again or register if you're a new user.");
            break;
          case 429:
            setError("Too many login attempts. Please try again later.");
            break;
          case 500:
            setError("Server error. Please try again later or contact support.");
            break;
          default:
            setError(`An error occurred during login. Please try again. ${err.response?.data?.error || err.message}`);
        }
        logError(err, `Login error - DID: ${did}, Status: ${err.response?.status}, Response: ${JSON.stringify(err.response?.data)}`);
      } else if (err instanceof Error) {
        if (err.message === 'Login successful but DID not returned') {
          setError("Login was successful, but there was an issue retrieving your account details. Please try again.");
        } else {
          setError("An unexpected error occurred. Please try again later.");
        }
        logError(err, `Unexpected login error - DID: ${did}`);
      } else {
        setError("An unknown error occurred. Please try again later.");
        logError(new Error(String(err)), `Unknown login error - DID: ${did}`);
      }
    }
  };

  const scroll = (scrollOffset: number) => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollLeft += scrollOffset;
      log('info', 'Info cards scrolled', { scrollOffset });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Or{' '}
          <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            register a new account
          </Link>
        </p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="did" className="block text-sm font-medium text-gray-300">
                Digital ID
              </label>
              <div className="mt-1">
                <input
                  id="did"
                  name="did"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 bg-gray-700 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={did}
                  onChange={(e) => setDid(e.target.value)}
                  placeholder="Enter your Digital ID"
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
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;