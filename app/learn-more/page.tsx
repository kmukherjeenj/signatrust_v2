'use client';

import React from 'react';
import Link from 'next/link';

export default function DigitalIDProsCons() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Digital IDs: The Real Deal
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Let's dive into the world of Digital IDs!
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <h3 className="text-lg font-medium text-white mb-4">
            🌟 The Pros
          </h3>
          <ul className="list-disc list-inside text-sm text-gray-300 mb-6">
            <li>✨ You own your data - Forget about big corporations owning your info!</li>
            <li>✨ Use it anywhere - Your Digital ID goes with you across platforms.</li>
            <li>✨ Privacy on point - Only share what you want, when you want.</li>
            <li>✨ Security upgrade - Better protection for your digital life.</li>
            <li>✨ Easy peasy logins - One ID to rule them all!</li>
          </ul>

          <h3 className="text-lg font-medium text-white mb-4">
            ⚠️ The Cons
          </h3>
          <ul className="list-disc list-inside text-sm text-gray-300 mb-6">
            <li>❗ Responsibility - Keep your private keys safe or else... 😱</li>
            <li>❗ Compatibility - Not all platforms support Digital IDs yet.</li>
            <li>❗ Learning curve - It might take some time to get used to.</li>
          </ul>

          <div className="mt-6">
            <Link
              href="/register"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-150 ease-in-out"
            >
              Ready to Own Your Digital Identity?
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <p className="text-center text-xs text-gray-400">
          By diving into Digital IDs, you're stepping into the future. Need more deets? Check out our{' '}
          <Link href="/terms" className="text-purple-400 hover:text-purple-300">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-purple-400 hover:text-purple-300">
            Privacy Policy
          </Link>.
        </p>
      </div>
    </div>
  );
}
