'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createAccount } from '../services/authService';

interface FormData {
  username: string;
  email: string;
  password: string;
}

export default function Register() {
  const [formData, setFormData] = useState<FormData>({ username: '', email: '', password: '' });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [registrationComplete, setRegistrationComplete] = useState<boolean>(false);
  const router = useRouter();

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

    try {
      const identifier = await createAccount(formData);
      console.log('Account created with DID:', identifier.did);
      setRegistrationComplete(true);
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Congratulations!
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            You now own your digital identity
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <h3 className="text-lg font-medium text-white mb-4">Welcome to the world of self-sovereign identity!</h3>
            <p className="text-sm text-gray-300 mb-4">
              You&apos;ve just created a decentralized identifier (DID) that belongs to you and only you. This is the foundation of your digital identity that you truly own and control.
            </p>
            <h4 className="text-md font-medium text-white mb-2">Benefits of your new digital identity:</h4>
            <ul className="list-disc list-inside text-sm text-gray-300 mb-4">
              <li>You control your data - no central authority owns your information</li>
              <li>Portable across different services and platforms</li>
              <li>Increased privacy and security in your digital interactions</li>
              <li>Simplified login processes - potentially replacing multiple usernames and passwords</li>
              <li>Ability to selectively disclose only the information you want to share</li>
            </ul>
            <p className="text-sm text-gray-300 mb-4">
              Your mobile identity goes wherever you go. It&apos;s not tied to any one platform or service, giving you the freedom to use it across various applications and websites that support decentralized identities.
            </p>
            <p className="text-sm text-gray-300 mb-6">
              Remember, with great power comes great responsibility. Keep your identity secure and never share your private keys with anyone.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-150 ease-in-out"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Welcome to SignaTrust
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Create your account and own your digital identity
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Form fields remain the same */}
            {/* ... */}

            {error && (
              <div className="text-red-500 text-sm mt-2">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-150 ease-in-out"
              >
                {isLoading ? 'Creating your identity...' : 'Create Your Identity'}
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
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150 ease-in-out"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <p className="text-center text-xs text-gray-400">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="text-purple-400 hover:text-purple-300">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-purple-400 hover:text-purple-300">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}