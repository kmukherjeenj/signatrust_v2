// File: app/signature/[id]/page.tsx

import React from 'react';
import { verifySignature } from '@/app/lib/auth/authService';
import Link from 'next/link';

export default async function SignaturePage({ params }: { params: { id: string } }) {
  let isValid = false;
  let error = null;

  try {
    isValid = await verifySignature(params.id);
  } catch (err) {
    console.error('Signature verification error:', err);
    error = "We couldn&apos;t verify this signature. Please try again.";
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Signature Checker
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          We use advanced technology to keep your signatures safe and private
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error ? (
            <p className="text-red-600 text-center">{error}</p>
          ) : (
            <div>
              <p className="text-center text-xl font-medium text-gray-900 mb-4">
                This signature is {isValid ? (
                  <span className="text-green-600">valid and secure</span>
                ) : (
                  <span className="text-red-600">not valid</span>
                )}
              </p>
              {isValid && (
                <p className="text-green-600 text-sm text-center">
                  Great news! This signature is authentic and hasn&apos;t been tampered with.
                </p>
              )}
            </div>
          )}
          
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">What makes our signatures special?</h3>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>Your signature is super secure - it&apos;s like a digital fingerprint that can&apos;t be copied.</li>
              <li>We use blockchain technology, which is like a super-secure digital ledger.</li>
              <li>Only you can use your signature - it&apos;s tied to your unique digital ID.</li>
              <li>You don&apos;t need to trust us or any other company - the technology proves everything.</li>
              <li>Your documents stay on your own computer or phone - we never see or store them.</li>
            </ul>
          </div>

          <div className="mt-6 bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">The Best Part: You&apos;re in Control</h3>
            <p className="text-gray-600">
              Unlike other signature services, we don&apos;t keep your documents on our computers. Here&apos;s why that&apos;s great for you:
            </p>
            <ul className="list-disc pl-5 text-gray-600 mt-2 space-y-1">
              <li>Your files stay on your device, just like your physical documents stay in your home.</li>
              <li>You decide who sees your documents - we can&apos;t peek at them even if we wanted to.</li>
              <li>No worries about hackers stealing your info from our servers - because it&apos;s not there!</li>
              <li>You can move, copy, or delete your files anytime, just like regular documents.</li>
            </ul>
          </div>

          <div className="mt-8 text-center">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-500">
              Back to Your Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}