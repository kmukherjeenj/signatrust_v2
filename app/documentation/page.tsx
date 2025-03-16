"use client";

import React from "react";
import Head from "next/head";

export default function Page() {
  return (
    <>
      <Head>
        <title>SignaTrust API Documentation</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <header>
        <a href="#" className="logo">
          <div className="logo-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              width="20"
              height="20"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <span className="logo-text">SignaTrust</span>
        </a>
        <nav>
          <a href="#">Home</a>
          <a href="#">API</a>
          <a href="#">Guides</a>
          <a href="#">Login</a>
          <a href="#" className="btn-register">
            Register
          </a>
        </nav>
      </header>

      <div className="container">
        <h1>SignaTrust API Documentation</h1>
        <p>
          <strong>Version 1.0</strong>
        </p>
        <p>
          This API enables seamless integration of SignaTrust's digital signing
          solutions into any platform with advanced blockchain security and
          zero-knowledge proof verification.
        </p>

        <div className="toc">
          <h2 id="table-of-contents">Table of Contents</h2>
          <ol>
            <li>
              <a href="#base-url">Base URL</a>
            </li>
            <li>
              <a href="#authentication-account-management">
                Authentication &amp; Account Management
              </a>
              <ul>
                <li>
                  <a href="#authenticate-user">Authenticate User</a>
                </li>
                <li>
                  <a href="#link-account">Link Account</a>
                </li>
              </ul>
            </li>
            <li>
              <a href="#user-management">User Management</a>
              <ul>
                <li>
                  <a href="#user-onboarding">User Onboarding</a>
                </li>
                <li>
                  <a href="#bulk-user-onboarding">Bulk User Onboarding</a>
                </li>
                <li>
                  <a href="#get-user-details">Get User Details</a>
                </li>
              </ul>
            </li>
            <li>
              <a href="#kyc-verification">KYC Verification</a>
              <ul>
                <li>
                  <a href="#verify-identity-api">Verify Identity</a>
                </li>
                <li>
                  <a href="#get-kyc-status">Get KYC Status</a>
                </li>
              </ul>
            </li>
            <li>
              <a href="#document-management">Document Management API</a>
              <ul>
                <li>
                  <a href="#get-documents">Get Documents</a>
                </li>
                <li>
                  <a href="#upload-document">Upload Document</a>
                </li>
              </ul>
            </li>
            <li>
              <a href="#identity-verification">Identity Verification API</a>
              <ul>
                <li>
                  <a href="#verify-identity-api">Verify Identity</a>
                </li>
                <li>
                  <a href="#get-verification-status">Get Verification Status</a>
                </li>
              </ul>
            </li>
            <li>
              <a href="#signature-requests">Signature Requests</a>
              <ul>
                <li>
                  <a href="#send-signature">Send Signature Request</a>
                </li>
                <li>
                  <a href="#get-signature">Get Signature Status</a>
                </li>
                <li>
                  <a href="#request-digital-signature">
                    Request Digital Signature
                  </a>
                </li>
                <li>
                  <a href="#create-workflow">Create Workflow</a>
                </li>
                <li>
                  <a href="#set-reminder">Set Reminder</a>
                </li>
              </ul>
            </li>
            <li>
              <a href="#security">Security &amp; Compliance</a>
            </li>
            <li>
              <a href="#integration">
                Integration Guide &amp; Developer Support
              </a>
            </li>
            <li>
              <a href="#error-handling">Error Handling</a>
            </li>
            <li>
              <a href="#testing">Postman &amp; cURL Testing Instructions</a>
            </li>
          </ol>
        </div>

        <h2 id="base-url">1. Base URL</h2>
        <div className="section">
          <pre>
            <code>{`https://api.signatrust.io/v1`}</code>
          </pre>
        </div>

        <h2 id="authentication-account-management">
          2. Authentication &amp; Account Management
        </h2>
        <p>Manage user authentication, account linking, and permissions.</p>
        <div className="section">
          <h3 id="authenticate-user">2.1 Authenticate User</h3>
          <p>Authenticate via API key or OAuth.</p>
          <span className="endpoint">POST /auth/login</span>
          <h4>Request Headers:</h4>
          <table>
            <tbody>
              <tr>
                <th>Header</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
              <tr>
                <td>Authorization</td>
                <td>String</td>
                <td>Yes</td>
                <td>Bearer token (API_KEY)</td>
              </tr>
              <tr>
                <td>Content-Type</td>
                <td>String</td>
                <td>Yes</td>
                <td>application/json</td>
              </tr>
            </tbody>
          </table>
          <h4>Request Parameters:</h4>
          <table>
            <tbody>
              <tr>
                <th>Parameter</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
              <tr>
                <td>username</td>
                <td>String</td>
                <td>Yes</td>
                <td>User's email or username</td>
              </tr>
              <tr>
                <td>password</td>
                <td>String</td>
                <td>Yes</td>
                <td>User's password</td>
              </tr>
            </tbody>
          </table>
          <h4>Request:</h4>
          <pre>
            <code>{`{
  "username": "user@example.com",
  "password": "securepassword"
}`}</code>
          </pre>
          <h4>Response:</h4>
          <pre>
            <code>{`{
  "user_id": "12345",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI...",
  "expires_in": 3600
}`}</code>
          </pre>
        </div>

        <div className="section">
          <h3 id="link-account">2.2 Link Account</h3>
          <p>Links a SignaTrust account to an external platform user.</p>
          <span className="endpoint">POST /users/link</span>
          <h4>Request Headers:</h4>
          <table>
            <tbody>
              <tr>
                <th>Header</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
              <tr>
                <td>x-api-key</td>
                <td>String</td>
                <td>Yes</td>
                <td>API Key for security</td>
              </tr>
              <tr>
                <td>Content-Type</td>
                <td>String</td>
                <td>Yes</td>
                <td>application/json</td>
              </tr>
            </tbody>
          </table>
          <h4>Request Parameters:</h4>
          <table>
            <tbody>
              <tr>
                <th>Parameter</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
              <tr>
                <td>user_id</td>
                <td>String</td>
                <td>Yes</td>
                <td>SignaTrust User ID</td>
              </tr>
              <tr>
                <td>external_platform_id</td>
                <td>String</td>
                <td>Yes</td>
                <td>ID of the external platform user</td>
              </tr>
            </tbody>
          </table>
          <h4>Request:</h4>
          <pre>
            <code>{`{
  "user_id": "12345",
  "external_platform_id": "PLATFORM-98765"
}`}</code>
          </pre>
          <h4>Response:</h4>
          <pre>
            <code>{`{
  "status": "linked",
  "linked_at": "2025-02-08T10:30:00Z"
}`}</code>
          </pre>
        </div>
        <h2 id="user-management">3. User Management API</h2>
        <p>Manage user registration and information.</p>
        <div className="section">
          <h3 id="user-onboarding">3.1 User Onboarding</h3>
          <p>Registers a new user in the system.</p>
          <span className="endpoint">POST /users/register</span>
          <h4>Request Headers:</h4>
          <table>
            <tbody>
              <tr>
                <th>Header</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
              <tr>
                <td>x-api-key</td>
                <td>String</td>
                <td>Yes</td>
                <td>API Key for security</td>
              </tr>
              <tr>
                <td>Content-Type</td>
                <td>String</td>
                <td>Yes</td>
                <td>application/json</td>
              </tr>
            </tbody>
          </table>
          <h4>Request Parameters:</h4>
          <table>
            <tbody>
              <tr>
                <th>Parameter</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
              <tr>
                <td>email</td>
                <td>String</td>
                <td>Yes</td>
                <td>User's email address</td>
              </tr>
              <tr>
                <td>full_name</td>
                <td>String</td>
                <td>Yes</td>
                <td>User's full name</td>
              </tr>
              <tr>
                <td>password</td>
                <td>String</td>
                <td>Yes</td>
                <td>User's secure password</td>
              </tr>
            </tbody>
          </table>
          <h4>Request:</h4>
          <pre>
            <code>{`{
  "email": "user@example.com",
  "full_name": "John Doe",
  "password": "SecurePassword123"
}`}</code>
          </pre>
          <h4>Response:</h4>
          <pre>
            <code>{`{
  "user_id": "98765",
  "status": "registered",
  "created_at": "2025-03-10T12:34:56Z"
}`}</code>
          </pre>
        </div>

        <div className="section">
          <h3 id="bulk-user-onboarding">3.2 Bulk User Onboarding</h3>
          <p>Register multiple users in a single request.</p>
          <span className="endpoint">POST /users/bulk-register</span>
          <h4>Request Headers:</h4>
          <table>
            <tbody>
              <tr>
                <th>Header</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
              <tr>
                <td>x-api-key</td>
                <td>String</td>
                <td>Yes</td>
                <td>API Key for security</td>
              </tr>
              <tr>
                <td>Content-Type</td>
                <td>String</td>
                <td>Yes</td>
                <td>application/json</td>
              </tr>
            </tbody>
          </table>
          <h4>Request Parameters:</h4>
          <table>
            <tbody>
              <tr>
                <th>Parameter</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
              <tr>
                <td>users</td>
                <td>Array</td>
                <td>Yes</td>
                <td>
                  Array of user objects with email, full_name, and password
                </td>
              </tr>
            </tbody>
          </table>
          <h4>Request:</h4>
          <pre>
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
          <h4>Response:</h4>
          <pre>
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

        <div className="section">
          <h3 id="get-user-details">3.3 Get User Details</h3>
          <p>Retrieve details for a specific user.</p>
          <span className="endpoint">GET /users/&lcub;user_id&rcub;</span>
          <h4>Request Headers:</h4>
          <table>
            <tbody>
              <tr>
                <th>Header</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
              <tr>
                <td>x-api-key</td>
                <td>String</td>
                <td>Yes</td>
                <td>API Key for security</td>
              </tr>
              <tr>
                <td>Content-Type</td>
                <td>String</td>
                <td>Yes</td>
                <td>application/json</td>
              </tr>
            </tbody>
          </table>
          <h4>Path Parameters:</h4>
          <table>
            <tbody>
              <tr>
                <th>Parameter</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
              <tr>
                <td>user_id</td>
                <td>String</td>
                <td>Yes</td>
                <td>SignaTrust User ID</td>
              </tr>
            </tbody>
          </table>
          <h4>Response:</h4>
          <pre>
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

        <h2 id="kyc-verification">4. KYC Verification API</h2>
        <p>Verify user identity through document uploads.</p>
        <div className="section">
          <h3 id="verify-identity-api">4.1 Verify Identity</h3>
          <p>Initiate identity verification process.</p>
          <span className="endpoint">POST /api/kyc/verify</span>
          <h4>Request Headers:</h4>
          <table>
            <tbody>
              <tr>
                <th>Header</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
              <tr>
                <td>x-api-key</td>
                <td>String</td>
                <td>Yes</td>
                <td>API Key for security</td>
              </tr>
              <tr>
                <td>Content-Type</td>
                <td>String</td>
                <td>Yes</td>
                <td>multipart/form-data</td>
              </tr>
            </tbody>
          </table>
          <h4>Request Parameters:</h4>
          <table>
            <tbody>
              <tr>
                <th>Parameter</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
              <tr>
                <td>selfie</td>
                <td>File</td>
                <td>Yes</td>
                <td>A clear selfie image</td>
              </tr>
              <tr>
                <td>idDocument</td>
                <td>File</td>
                <td>Yes</td>
                <td>Government ID document</td>
              </tr>
            </tbody>
          </table>
          <h4>Request:</h4>
          <pre>
            <code>{`Form Data:
  - selfie: [file]
  - idDocument: [file]`}</code>
          </pre>
          <h4>Response:</h4>
          <pre>
            <code>{`{
  "message": "Verification Successful",
  "selfieHash": "a1b2c3d4e5...",
  "idHash": "f6g7h8i9j0...",
  "timestamp": "2025-03-10T12:34:56Z"
}`}</code>
          </pre>
        </div>

        <div className="section">
          <h3 id="get-kyc-status">4.2 Get KYC Status</h3>
          <p>Retrieve the KYC verification status for a user.</p>
          <span className="endpoint">GET /users/&lcub;user_id&rcub;</span>
          <h4>Request Headers:</h4>
          <table>
            <tbody>
              <tr>
                <th>Header</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
              <tr>
                <td>x-api-key</td>
                <td>String</td>
                <td>Yes</td>
                <td>API Key for security</td>
              </tr>
              <tr>
                <td>Content-Type</td>
                <td>String</td>
                <td>Yes</td>
                <td>application/json</td>
              </tr>
            </tbody>
          </table>
          <h4>Path Parameters:</h4>
          <table>
            <tbody>
              <tr>
                <th>Parameter</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
              <tr>
                <td>user_id</td>
                <td>String</td>
                <td>Yes</td>
                <td>SignaTrust User ID</td>
              </tr>
            </tbody>
          </table>
          <h4>Response:</h4>
          <pre>
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

        <h2 id="signature-requests">7. Signature Requests</h2>
        <p>Manage document signing workflows.</p>
        <div className="section">
          <h3 id="send-signature">7.1 Send Signature Request</h3>
          <p>Create a new signature request.</p>
          <span className="endpoint">POST /signatures</span>
          <h4>Request Headers:</h4>
          <table>
            <tbody>
              <tr>
                <th>Header</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
              <tr>
                <td>x-api-key</td>
                <td>String</td>
                <td>Yes</td>
                <td>API Key for security</td>
              </tr>
              <tr>
                <td>Content-Type</td>
                <td>String</td>
                <td>Yes</td>
                <td>application/json</td>
              </tr>
            </tbody>
          </table>
          <h4>Request Parameters:</h4>
          <table>
            <tbody>
              <tr>
                <th>Parameter</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
              <tr>
                <td>signer_email</td>
                <td>String</td>
                <td>Yes</td>
                <td>Email of the signer</td>
              </tr>
              <tr>
                <td>document_url</td>
                <td>String</td>
                <td>Yes</td>
                <td>URL of the document to be signed</td>
              </tr>
              <tr>
                <td>redirect_url</td>
                <td>String</td>
                <td>No</td>
                <td>URL to redirect after signing</td>
              </tr>
              <tr>
                <td>expiration</td>
                <td>String</td>
                <td>No</td>
                <td>Expiration date (ISO format)</td>
              </tr>
            </tbody>
          </table>
          <h4>Request:</h4>
          <pre>
            <code>{`{
  "signer_email": "user@example.com",
  "document_url": "https://example.com/docs/contract.pdf",
  "redirect_url": "https://example.com/confirmation",
  "expiration": "2025-04-10T00:00:00Z"
}`}</code>
          </pre>
          <h4>Response:</h4>
          <pre>
            <code>{`{
  "request_id": "SIGN-001",
  "signing_url": "https://signatrust.com/sign/SIGN-001",
  "expires_at": "2025-04-10T00:00:00Z"
}`}</code>
          </pre>
        </div>

        <div className="section">
          <h3 id="get-signature">7.2 Get Signature Status</h3>
          <p>Check status of a signature request.</p>
          <span className="endpoint">
            GET /signatures/&lcub;request_id&lcub;
          </span>
          <h4>Request Headers:</h4>
          <table>
            <tbody>
              <tr>
                <th>Header</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
              <tr>
                <td>x-api-key</td>
                <td>String</td>
                <td>Yes</td>
                <td>API Key for security</td>
              </tr>
              <tr>
                <td>Content-Type</td>
                <td>String</td>
                <td>Yes</td>
                <td>application/json</td>
              </tr>
            </tbody>
          </table>
          <h4>Path Parameters:</h4>
          <table>
            <tbody>
              <tr>
                <th>Parameter</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
              <tr>
                <td>request_id</td>
                <td>String</td>
                <td>Yes</td>
                <td>Signature request ID</td>
              </tr>
            </tbody>
          </table>
          <h4>Response:</h4>
          <pre>
            <code>{`{
  "request_id": "SIGN-001",
  "status": "pending",
  "signer_email": "user@example.com",
  "document_url": "https://example.com/docs/contract.pdf",
  "created_at": "2025-03-10T12:34:56Z",
  "expires_at": "2025-04-10T00:00:00Z",
  "signed_at": null
}`}</code>
          </pre>
        </div>

        <div className="section">
          <h3 id="request-digital-signature">7.3 Request Digital Signature</h3>
          <p>Request a cryptographic signature with blockchain verification.</p>
          <span className="endpoint">POST /api/signature/request</span>
          <h4>Request Headers:</h4>
          <table>
            <tbody>
              <tr>
                <th>Header</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
              <tr>
                <td>x-api-key</td>
                <td>String</td>
                <td>Yes</td>
                <td>API Key for security</td>
              </tr>
              <tr>
                <td>Content-Type</td>
                <td>String</td>
                <td>Yes</td>
                <td>application/json</td>
              </tr>
            </tbody>
          </table>
          <h4>Request Parameters:</h4>
          <table>
            <tbody>
              <tr>
                <th>Parameter</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
              <tr>
                <td>document_id</td>
                <td>String</td>
                <td>Yes</td>
                <td>ID of the document to sign</td>
              </tr>
              <tr>
                <td>user_id</td>
                <td>String</td>
                <td>Yes</td>
                <td>ID of the signer</td>
              </tr>
              <tr>
                <td>signature_type</td>
                <td>String</td>
                <td>Yes</td>
                <td>Type of signature (simple, qualified, advanced)</td>
              </tr>
              <tr>
                <td>blockchain_verification</td>
                <td>Boolean</td>
                <td>No</td>
                <td>Enable blockchain verification (default: true)</td>
              </tr>
            </tbody>
          </table>
          <h4>Request:</h4>
          <pre>
            <code>{`{
  "document_id": "DOC-123",
  "user_id": "12345",
  "signature_type": "qualified",
  "blockchain_verification": true
}`}</code>
          </pre>
          <h4>Response:</h4>
          <pre>
            <code>{`{
  "signature_id": "SIG-456",
  "status": "pending",
  "document_id": "DOC-123",
  "signing_url": "https://signatrust.io/sign/SIG-456",
  "expires_at": "2025-03-17T12:34:56Z"
}`}</code>
          </pre>
        </div>

        <div className="section">
          <h3 id="create-workflow">7.4 Create Workflow</h3>
          <p>Create a sequential signing workflow with multiple signers.</p>
          <span className="endpoint">POST /api/workflows</span>
          <h4>Request Headers:</h4>
          <table>
            <tbody>
              <tr>
                <th>Header</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
              <tr>
                <td>x-api-key</td>
                <td>String</td>
                <td>Yes</td>
                <td>API Key for security</td>
              </tr>
              <tr>
                <td>Content-Type</td>
                <td>String</td>
                <td>Yes</td>
                <td>application/json</td>
              </tr>
            </tbody>
          </table>
          <h4>Request Parameters:</h4>
          <table>
            <tbody>
              <tr>
                <th>Parameter</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
              <tr>
                <td>document_id</td>
                <td>String</td>
                <td>Yes</td>
                <td>ID of the document to sign</td>
              </tr>
              <tr>
                <td>signers</td>
                <td>Array</td>
                <td>Yes</td>
                <td>Ordered array of signers</td>
              </tr>
              <tr>
                <td>conditional_routes</td>
                <td>Array</td>
                <td>No</td>
                <td>Routing logic based on conditions</td>
              </tr>
              <tr>
                <td>expiration</td>
                <td>String</td>
                <td>No</td>
                <td>Workflow expiration date (ISO format)</td>
              </tr>
            </tbody>
          </table>
          <h4>Request:</h4>
          <pre>
            <code>{`{
  "document_id": "DOC-123",
  "signers": [
    {
      "email": "manager@example.com",
      "name": "John Manager",
      "order": 1
    },
    {
      "email": "director@example.com",
      "name": "Jane Director",
      "order": 2
    }
  ],
  "conditional_routes": [
    {
      "if_field": "contract_value",
      "condition": "greater_than",
      "value": 10000,
      "then_add_signer": {
        "email": "cfo@example.com",
        "name": "CFO",
        "order": 3
      }
    }
  ],
  "expiration": "2025-04-10T00:00:00Z"
}`}</code>
          </pre>
          <h4>Response:</h4>
          <pre>
            <code>{`{
  "workflow_id": "WF-123",
  "document_id": "DOC-123",
  "status": "initiated",
  "current_signer": {
    "email": "manager@example.com",
    "order": 1
  },
  "created_at": "2025-03-10T12:34:56Z",
  "expires_at": "2025-04-10T00:00:00Z"
}`}</code>
          </pre>
        </div>

        <div className="section">
          <h3 id="set-reminder">7.5 Set Reminder</h3>
          <p>Configure automatic reminders for pending signatures.</p>
          <span className="endpoint">POST /api/reminders</span>
          <h4>Request Headers:</h4>
          <table>
            <tbody>
              <tr>
                <th>Header</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
              <tr>
                <td>x-api-key</td>
                <td>String</td>
                <td>Yes</td>
                <td>API Key for security</td>
              </tr>
              <tr>
                <td>Content-Type</td>
                <td>String</td>
                <td>Yes</td>
                <td>application/json</td>
              </tr>
            </tbody>
          </table>
          <h4>Request Parameters:</h4>
          <table>
            <tbody>
              <tr>
                <th>Parameter</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
              <tr>
                <td>signature_id</td>
                <td>String</td>
                <td>Yes</td>
                <td>ID of the signature request</td>
              </tr>
              <tr>
                <td>frequency</td>
                <td>String</td>
                <td>Yes</td>
                <td>Reminder frequency (daily, weekly)</td>
              </tr>
              <tr>
                <td>max_reminders</td>
                <td>Integer</td>
                <td>No</td>
                <td>Maximum number of reminders to send</td>
              </tr>
              <tr>
                <td>custom_message</td>
                <td>String</td>
                <td>No</td>
                <td>Optional custom reminder message</td>
              </tr>
            </tbody>
          </table>
          <h4>Request:</h4>
          <pre>
            <code>{`{
  "signature_id": "SIG-456",
  "frequency": "daily",
  "max_reminders": 5,
  "custom_message": "Your signature is still pending for the contract"
}`}</code>
          </pre>
          <h4>Response:</h4>
          <pre>
            <code>{`{
  "reminder_id": "REM-789",
  "signature_id": "SIG-456",
  "status": "scheduled",
  "frequency": "daily",
  "next_reminder": "2025-03-11T12:34:56Z",
  "reminders_sent": 0,
  "max_reminders": 5
}`}</code>
          </pre>
        </div>

        <h2 id="security">8. Security &amp; Compliance</h2>
        <div className="section">
          <h3>Blockchain Security</h3>
          <p>
            SignaTrust utilizes advanced blockchain technology to ensure
            document integrity and non-repudiation:
          </p>
          <ul>
            <li>
              Each document and signature is hashed and recorded on a public
              blockchain
            </li>
            <li>Immutable audit trail for all document activities</li>
            <li>Tamper-evident verification system</li>
            <li>Distributed ledger for enhanced security and transparency</li>
          </ul>
        </div>

        <div className="section">
          <h3>Zero-Knowledge Proofs (ZKP)</h3>
          <p>Our platform implements ZKP for enhanced privacy and security:</p>
          <ul>
            <li>Authentication without revealing sensitive data</li>
            <li>
              Cryptographic verification of identity without sharing personal
              information
            </li>
            <li>Secure document verification while maintaining privacy</li>
            <li>Compliance with GDPR and data minimization principles</li>
          </ul>
        </div>

        <div className="section">
          <h3>Compliance Standards</h3>
          <p>
            SignaTrust meets international standards for electronic signatures:
          </p>
          <ul>
            <li>ESIGN Act (United States)</li>
            <li>eIDAS Regulation (European Union)</li>
            <li>UETA (Uniform Electronic Transactions Act)</li>
            <li>21 CFR Part 11 compliance for regulated industries</li>
            <li>SOC 2 Type II certified infrastructure</li>
          </ul>
        </div>

        <h2 id="integration">9. Integration Guide &amp; Developer Support</h2>
        <div className="section">
          <h3>Web2 Integration</h3>
          <p>Standard integration with existing web platforms:</p>
          <ul>
            <li>RESTful API for seamless integration</li>
            <li>Webhook support for event notifications</li>
            <li>OAuth 2.0 for secure authorization</li>
            <li>Custom CSS for white-label solutions</li>
          </ul>
        </div>

        <div className="section">
          <h3>Web3 Integration</h3>
          <p>Advanced blockchain integration capabilities:</p>
          <ul>
            <li>Smart contract interaction</li>
            <li>Wallet authentication support</li>
            <li>Multi-chain compatibility (Ethereum, Polygon, Solana)</li>
            <li>NFT-based certificate generation</li>
          </ul>
        </div>

        <div className="section">
          <h3>Developer Resources</h3>
          <p>Resources available for implementation:</p>
          <ul>
            <li>Interactive API documentation</li>
            <li>
              SDKs for popular programming languages (JavaScript, Python, Java)
            </li>
            <li>Sample applications and GitHub repositories</li>
            <li>Developer community forum</li>
          </ul>
        </div>

        <h2 id="error-handling">10. Error Handling</h2>
        <div className="section">
          <h3>Error Codes</h3>
          <p>Common error codes and their meanings:</p>
          <table>
            <tbody>
              <tr>
                <th>Code</th>
                <th>Description</th>
                <th>Recommended Action</th>
              </tr>
              <tr>
                <td>400</td>
                <td>Bad Request</td>
                <td>Check request parameters</td>
              </tr>
              <tr>
                <td>401</td>
                <td>Unauthorized</td>
                <td>Verify API key or authentication token</td>
              </tr>
              <tr>
                <td>403</td>
                <td>Forbidden</td>
                <td>Check permission levels</td>
              </tr>
              <tr>
                <td>404</td>
                <td>Not Found</td>
                <td>Verify resource identifier</td>
              </tr>
              <tr>
                <td>409</td>
                <td>Conflict</td>
                <td>Resource already exists</td>
              </tr>
              <tr>
                <td>422</td>
                <td>Unprocessable Entity</td>
                <td>Validation error in request</td>
              </tr>
              <tr>
                <td>429</td>
                <td>Too Many Requests</td>
                <td>Implement rate limiting or backoff strategy</td>
              </tr>
              <tr>
                <td>500</td>
                <td>Server Error</td>
                <td>Contact support</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="section">
          <h3>Best Practices</h3>
          <p>Implementation recommendations:</p>
          <ul>
            <li>Always validate user input before submitting to API</li>
            <li>Implement proper error handling with fallbacks</li>
            <li>Use webhook notifications for asynchronous operations</li>
            <li>Store API keys securely and rotate regularly</li>
            <li>Implement rate limiting on your side to prevent 429 errors</li>
            <li>Log all API interactions for troubleshooting</li>
            <li>Use the sandbox environment for testing before production</li>
          </ul>
        </div>

        <h2 id="testing">11. Postman &amp; cURL Testing Instructions</h2>
        <div className="section">
          <h3>Postman Testing</h3>
          <p>Follow these steps to test the API using Postman:</p>
          <ol>
            <li>
              <strong>Create a new request:</strong> Open Postman and create a
              new request.
            </li>
            <li>
              <strong>Set the Request URL:</strong> For example, to test user
              authentication, set the URL to:
              <pre>
                <code>{`https://api.signatrust.io/v1/auth/login`}</code>
              </pre>
            </li>
            <li>
              <strong>Add Request Headers:</strong>
              <ul>
                <li>
                  <code>Authorization: Bearer YOUR_API_KEY</code> (for endpoints
                  requiring auth)
                </li>
                <li>
                  <code>x-api-key: YOUR_API_KEY</code> (for endpoints using API
                  key)
                </li>
                <li>
                  <code>Content-Type: application/json</code>
                </li>
              </ul>
            </li>
            <li>
              <strong>Set the Request Body:</strong> Under the Body tab, select
              "raw" and choose "JSON" as the format. Paste the example JSON. For
              instance, for login:
              <pre>
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

          <h3>cURL Testing</h3>
          <p>Below are example cURL commands for testing various endpoints:</p>

          <h4>Authenticate User</h4>
          <pre>
            <code>{`curl --location --request POST 'https://api.signatrust.io/v1/auth/login' \
--header 'Authorization: Bearer YOUR_API_KEY' \
--header 'Content-Type: application/json' \
--data-raw '{
    "username": "user@example.com",
    "password": "securepassword"
}'`}</code>
          </pre>

          <h4>Get Documents</h4>
          <pre>
            <code>{`curl --location --request GET 'https://api.signatrust.io/v1/documents?user_id=12345&limit=20&offset=0' \
--header 'x-api-key: YOUR_API_KEY' \
--header 'Content-Type: application/json'`}</code>
          </pre>

          <h4>Upload Document</h4>
          <pre>
            <code>{`curl --location --request POST 'https://api.signatrust.io/v1/documents/upload' \
--header 'x-api-key: YOUR_API_KEY' \
--form 'document=@"/path/to/your/document.pdf"' \
--form 'title="Employment Contract"' \
--form 'description="Standard employment contract for new hires"' \
--form 'user_id="12345"'`}</code>
          </pre>
        </div>

        <div
          className="section"
          style={{ textAlign: "center", marginTop: "2rem" }}
        >
          <p>
            For integration support, contact{" "}
            <strong>dev-support@signatrust.com</strong> or visit our Developer
            Portal.
          </p>
          <p style={{ fontWeight: "bold", color: "var(--primary-purple)" }}>
            SignaTrust - Redefining Digital Signatures with Blockchain Security
          </p>
        </div>
      </div>

      <style jsx global>{`
        :root {
          --primary-purple: #9333ea;
          --primary-dark: #111827;
          --primary-gray: #f3f4f6;
          --secondary-gray: #e5e7eb;
          --border-gray: #d1d5db;
          --text-dark: #1f2937;
          --text-gray: #4b5563;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: var(--text-dark);
          background-color: white;
          margin: 0;
          padding: 0;
        }

        header {
          background-color: var(--primary-dark);
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
        }

        .logo-icon {
          background-color: var(--primary-purple);
          color: white;
          width: 2rem;
          height: 2rem;
          border-radius: 0.375rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-text {
          color: white;
          font-weight: bold;
          font-size: 1.25rem;
        }

        nav {
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }

        nav a {
          color: white;
          text-decoration: none;
        }

        .btn-register {
          background-color: var(--primary-purple);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          font-weight: 500;
          text-decoration: none;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        h1 {
          font-size: 2.25rem;
          color: var(--text-dark);
          border-bottom: 2px solid var(--secondary-gray);
          padding-bottom: 0.75rem;
          margin-bottom: 1.5rem;
        }

        h2 {
          font-size: 1.75rem;
          color: var(--primary-purple);
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          border-bottom: 1px solid var(--secondary-gray);
          padding-bottom: 0.5rem;
        }

        h3 {
          font-size: 1.25rem;
          color: var(--text-dark);
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }

        pre,
        code {
          font-family: Menlo, Monaco, "Courier New", monospace;
          background-color: var(--primary-gray);
          border-radius: 0.375rem;
        }

        pre {
          padding: 1rem;
          overflow-x: auto;
          margin: 1rem 0;
          border: 1px solid var(--border-gray);
        }

        code {
          padding: 0.125rem 0.25rem;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }

        th {
          background-color: var(--primary-gray);
          text-align: left;
          padding: 0.75rem;
          border: 1px solid var(--border-gray);
        }

        td {
          padding: 0.75rem;
          border: 1px solid var(--border-gray);
        }

        .endpoint {
          display: inline-block;
          background-color: var(--primary-dark);
          color: white;
          font-weight: bold;
          padding: 0.5rem 0.75rem;
          border-radius: 0.375rem;
          margin: 0.5rem 0;
        }

        .section {
          background-color: var(--primary-gray);
          border: 1px solid var(--border-gray);
          border-radius: 0.5rem;
          padding: 1.5rem;
          margin: 1.5rem 0;
        }

        .toc {
          background-color: var(--primary-gray);
          border: 1px solid var(--border-gray);
          border-radius: 0.5rem;
          padding: 1.5rem;
          margin: 1.5rem 0;
        }

        .toc a {
          color: var(--primary-purple);
          text-decoration: none;
        }

        .toc a:hover {
          text-decoration: underline;
        }

        .toc ol {
          padding-left: 1.5rem;
        }

        .toc ul {
          padding-left: 1.5rem;
          list-style-type: disc;
        }
      `}</style>
    </>
  );
}
