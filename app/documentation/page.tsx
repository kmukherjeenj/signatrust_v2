/* eslint-disable react/no-unescaped-entities */
"use client";

import Head from "next/head";
import Link from "next/link";

export default function DocumentationPage() {
  return (
    <>
      <Head>
        <title>SignaTrust API Documentation</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="container mx-auto px-6 py-10 bg-white text-gray-900">
        <h1 className="text-4xl font-bold mb-4">
          SignaTrust API Documentation
        </h1>
        <p className="text-lg text-gray-700">Version 1.0</p>
        <p className="mt-2 text-gray-800">
          This API enables seamless integration of SignaTrust&apos;s digital
          signing solutions into any platform with advanced blockchain security
          and zero-knowledge proof verification.
        </p>

        {/* Base URL Section */}
        <section className="mt-6 p-4 bg-gray-200 rounded-lg border border-gray-300">
          <h2 className="text-xl font-semibold">Base URL</h2>
          <pre className="bg-gray-100 text-gray-900 p-3 rounded-lg border border-gray-400 mt-2">
            <code>https://api.signatrust.io/v1</code>
          </pre>
        </section>

        {/* Authentication & Account Management */}
        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-2">
            1. Authentication &amp; Account Management
          </h2>
          <p className="text-gray-700 mb-4">
            Manage user authentication, account linking, and permissions.
          </p>
          {/* Authenticate User */}
          <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
            <h3 className="text-lg font-semibold">1.1 Authenticate User</h3>
            <p>Authenticate via API key or OAuth.</p>
            <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400 mt-2">
              <code>POST /auth/login</code>
            </pre>
            <p className="font-semibold mt-2">Headers:</p>
            <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400">
              <code>{`Authorization: Bearer YOUR_API_KEY
Content-Type: application/json`}</code>
            </pre>
            <p className="font-semibold mt-2">Request:</p>
            <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400">
              <code>{`{
  "username": "user@example.com",
  "password": "securepassword"
}`}</code>
            </pre>
            <p className="font-semibold mt-2">Response:</p>
            <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400">
              <code>{`{
  "user_id": "12345",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI...",
  "expires_in": 3600
}`}</code>
            </pre>
          </div>
          {/* Link Account */}
          <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
            <h3 className="text-lg font-semibold">1.2 Link Account</h3>
            <p>Links a SignaTrust account to an external platform user.</p>
            <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400 mt-2">
              <code>POST /users/link</code>
            </pre>
            <p className="font-semibold mt-2">Request:</p>
            <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400">
              <code>{`{
  "user_id": "12345",
  "external_platform_id": "PLATFORM-98765"
}`}</code>
            </pre>
            <p className="font-semibold mt-2">Response:</p>
            <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400">
              <code>{`{
  "status": "linked",
  "linked_at": "2025-02-08T10:30:00Z"
}`}</code>
            </pre>
          </div>
        </section>

        {/* User Management */}
        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-2">
            2. User Management API
          </h2>
          <p className="text-gray-700 mb-4">
            Manage user registration and information.
          </p>
          {/* User Onboarding */}
          <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
            <h3 className="text-lg font-semibold">2.1 User Onboarding</h3>
            <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400 mt-2">
              <code>POST /users/register</code>
            </pre>
            <p className="font-semibold mt-2">Request:</p>
            <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400">
              <code>{`{
  "email": "user@example.com",
  "full_name": "John Doe",
  "password": "SecurePassword123"
}`}</code>
            </pre>
            <p className="font-semibold mt-2">Response:</p>
            <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400">
              <code>{`{
  "user_id": "98765",
  "status": "registered",
  "created_at": "2025-03-10T12:34:56Z"
}`}</code>
            </pre>
          </div>
          {/* Bulk User Onboarding */}
          <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
            <h3 className="text-lg font-semibold">2.2 Bulk User Onboarding</h3>
            <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400 mt-2">
              <code>POST /users/bulk-register</code>
            </pre>
            <p className="font-semibold mt-2">Request:</p>
            <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400">
              <code>{`{
  "users": [
    {
      "email": "user1@example.com",
      "full_name": "John Doe",
      "password": "SecurePassword123"
    },
    {
      "email": "user2@example.com",
      "full_name": "Jane Smith",
      "password": "AnotherPassword456"
    }
  ]
}`}</code>
            </pre>
            <p className="font-semibold mt-2">Response:</p>
            <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400">
              <code>{`{
  "success_count": 2,
  "failed_count": 0,
  "users": [
    {
      "user_id": "98765",
      "email": "user1@example.com",
      "status": "registered"
    },
    {
      "user_id": "98766",
      "email": "user2@example.com",
      "status": "registered"
    }
  ],
  "created_at": "2025-03-10T12:34:56Z"
}`}</code>
            </pre>
          </div>
          {/* Get User Details */}
          <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
            <h3 className="text-lg font-semibold">2.3 Get User Details</h3>
            <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400 mt-2">
              <code>GET /users/{"{user_id}"}</code>
            </pre>
            <p className="font-semibold mt-2">Response:</p>
            <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400">
              <code>{`{
  "user_id": "98765",
  "email": "user@example.com",
  "full_name": "John Doe",
  "created_at": "2025-02-08T10:30:00Z",
  "status": "active",
  "verification_status": "verified"
}`}</code>
            </pre>
          </div>
        </section>

        {/* KYC Verification */}
        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-2">
            3. KYC Verification API
          </h2>
          <p className="text-gray-700 mb-4">
            Verify user identity through document uploads.
          </p>
          {/* Verify Identity */}
          <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
            <h3 className="text-lg font-semibold">3.1 Verify Identity</h3>
            <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400 mt-2">
              <code>POST /api/kyc/verify</code>
            </pre>
            <p className="font-semibold mt-2">Request:</p>
            <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400">
              <code>{`Form Data:
- selfie: [file]
- idDocument: [file]`}</code>
            </pre>
            <p className="font-semibold mt-2">Response:</p>
            <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400">
              <code>{`{
  "message": "Verification Successful",
  "selfieHash": "a1b2c3d4e5...",
  "idHash": "f6g7h8i9j0...",
  "timestamp": "2025-03-10T12:34:56Z"
}`}</code>
            </pre>
          </div>
          {/* Get KYC Status */}
          <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
            <h3 className="text-lg font-semibold">3.2 Get KYC Status</h3>
            <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400 mt-2">
              <code>GET /api/kyc/status/{"{user_id}"}</code>
            </pre>
            <p className="font-semibold mt-2">Response:</p>
            <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400">
              <code>{`{
  "user_id": "12345",
  "status": "verified",
  "verification_level": "full",
  "verified_at": "2025-03-08T15:20:30Z",
  "verification_expiry": "2026-03-08T15:20:30Z",
  "verification_details": {
    "id_verified": true,
    "selfie_verified": true,
    "address_verified": true,
    "blockchain_proof": "0x4a3dc1e28a96cd..."
  }
}`}</code>
            </pre>
          </div>
        </section>

        {/* Signature Requests */}
        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-2">4. Signature Requests</h2>
          <p className="text-gray-700 mb-4">
            Manage document signing workflows.
          </p>
          {/* Send Signature Request */}
          <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
            <h3 className="text-lg font-semibold">
              4.1 Send Signature Request
            </h3>
            <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400 mt-2">
              <code>POST /signatures</code>
            </pre>
            <p className="font-semibold mt-2">Request:</p>
            <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400">
              <code>{`{
  "signer_email": "user@example.com",
  "document_url": "https://example.com/docs/contract.pdf",
  "redirect_url": "https://example.com/confirmation"
}`}</code>
            </pre>
            <p className="font-semibold mt-2">Response:</p>
            <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400">
              <code>{`{
  "request_id": "SIGN-001",
  "signing_url": "https://signatrust.com/sign/SIGN-001"
}`}</code>
            </pre>
          </div>
          {/* Get Signature Status */}
          <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
            <h3 className="text-lg font-semibold">4.2 Get Signature Status</h3>
            <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400 mt-2">
              <code>GET /signatures/{"{request_id}"}</code>
            </pre>
            <p className="font-semibold mt-2">Response:</p>
            <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400">
              <code>{`{
  "request_id": "SIGN-001",
  "status": "pending",
  "signer_email": "user@example.com",
  "signed_at": null
}`}</code>
            </pre>
          </div>
          {/* Request Digital Signature */}
          <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
            <h3 className="text-lg font-semibold">
              4.3 Request Digital Signature
            </h3>
            <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400 mt-2">
              <code>POST /api/signature/request</code>
            </pre>
            <p className="font-semibold mt-2">Request:</p>
            <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400">
              <code>{`{
  "document_id": "DOC-123",
  "user_id": "12345",
  "signature_type": "qualified",
  "blockchain_verification": true
}`}</code>
            </pre>
            <p className="font-semibold mt-2">Response:</p>
            <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400">
              <code>{`{
  "signature_id": "SIG-456",
  "status": "pending",
  "document_id": "DOC-123",
  "signing_url": "https://signatrust.io/sign/SIG-456",
  "expires_at": "2025-03-17T12:34:56Z"
}`}</code>
            </pre>
          </div>
        </section>

        {/* Postman & cURL Testing Instructions */}
        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-2">
            5. Postman &amp; cURL Testing Instructions
          </h2>
          <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
            <h3 className="text-lg font-semibold">Postman Testing</h3>
            <ol className="list-decimal list-inside">
              <li>
                <strong>Create a new request:</strong> Open Postman and create a
                new request.
              </li>
              <li>
                <strong>Set the Request URL:</strong> For example, to test user
                authentication, set the URL to:
                <pre className="bg-gray-50 p-3 rounded-lg border border-gray-400 mt-2">
                  <code>{`https://api.signatrust.io/v1/auth/login`}</code>
                </pre>
              </li>
              <li>
                <strong>Add Request Headers:</strong>
                <ul className="list-disc list-inside">
                  <li>
                    <code>Authorization: Bearer YOUR_API_KEY</code> (for
                    endpoints requiring auth)
                  </li>
                  <li>
                    <code>x-api-key: YOUR_API_KEY</code> (for endpoints using
                    API key)
                  </li>
                  <li>
                    <code>Content-Type: application/json</code>
                  </li>
                </ul>
              </li>
              <li>
                <strong>Set the Request Body:</strong> Under the Body tab,
                select "raw" and choose "JSON" as the format. Paste the example
                JSON. For instance, for login:
                <pre className="bg-gray-50 p-3 rounded-lg border border-gray-400 mt-2">
                  <code>{`{
  "username": "user@example.com",
  "password": "securepassword"
}`}</code>
                </pre>
              </li>
              <li>
                <strong>Send the Request:</strong> Click "Send" and verify that
                the response matches the documentation.
              </li>
            </ol>
          </div>
          <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
            <h3 className="text-lg font-semibold">cURL Testing</h3>
            <p>
              Below are example cURL commands for testing various endpoints:
            </p>
            <h4 className="font-semibold">Authenticate User</h4>
            <pre className="bg-gray-50 p-3 rounded-lg border border-gray-400">
              <code>{`curl --location --request POST 'https://api.signatrust.io/v1/auth/login' \
--header 'Authorization: Bearer YOUR_API_KEY' \
--header 'Content-Type: application/json' \
--data-raw '{
    "username": "user@example.com",
    "password": "securepassword"
}'`}</code>
            </pre>
            <h4 className="font-semibold">Get Documents</h4>
            <pre className="bg-gray-50 p-3 rounded-lg border border-gray-400">
              <code>{`curl --location --request GET 'https://api.signatrust.io/v1/documents?user_id=12345&limit=20&offset=0' \
--header 'x-api-key: YOUR_API_KEY' \
--header 'Content-Type: application/json'`}</code>
            </pre>
            <h4 className="font-semibold">Upload Document</h4>
            <pre className="bg-gray-50 p-3 rounded-lg border border-gray-400">
              <code>{`curl --location --request POST 'https://api.signatrust.io/v1/documents/upload' \
--header 'x-api-key: YOUR_API_KEY' \
--form 'document=@"/path/to/your/document.pdf"' \
--form 'title="Employment Contract"' \
--form 'description="Standard employment contract for new hires"' \
--form 'user_id="12345"'`}</code>
            </pre>
          </div>
        </section>
      </main>
    </>
  );
}
