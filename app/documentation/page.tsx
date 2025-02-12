export default function DocumentationPage() {
  return (
    <main className="container mx-auto px-6 py-10 bg-white text-gray-900">
      {/* Header Section */}
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        SignaTrust API Documentation
      </h1>
      <p className="text-lg text-gray-700">Version 1.0</p>
      <p className="mt-2 text-gray-800">
        This API enables seamless integration of SignaTrust&apos;s digital
        signing solutions into any platform.
      </p>

      {/* Base URL Section */}
      <div className="mt-6 p-4 bg-gray-200 rounded-lg border border-gray-300">
        <h2 className="text-xl font-semibold text-gray-900">Base URL</h2>
        <pre className="bg-gray-100 text-gray-900 p-3 rounded-lg border border-gray-400 mt-2">
          <code>https://api.signatrust.io/v1</code>
        </pre>
      </div>

      {/* Authentication & User Management */}
      <section className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-900">
          1. Authentication & Account Management
        </h2>
        <p className="text-gray-700">
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
            <code>
              {`Authorization: Bearer {API_KEY}
Content-Type: application/json`}
            </code>
          </pre>
          <p className="font-semibold mt-2">Response:</p>
          <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400">
            <code>
              {`{
  "user_id": "12345",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI...",
  "expires_in": 3600
}`}
            </code>
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
            <code>
              {`{
  "user_id": "12345",
  "external_platform_id": "PLATFORM-98765"
}`}
            </code>
          </pre>
          <p className="font-semibold mt-2">Response:</p>
          <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400">
            <code>
              {`{
  "status": "linked",
  "linked_at": "2025-02-08T10:30:00Z"
}`}
            </code>
          </pre>
        </div>
      </section>

      {/* Signature Requests */}
      <section className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-900">
          2. Signature Requests
        </h2>
        <p className="text-gray-700">Manage document signing workflows.</p>

        {/* Send Signature Request */}
        <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
          <h3 className="text-lg font-semibold">2.1 Send Signature Request</h3>
          <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400 mt-2">
            <code>POST /signatures</code>
          </pre>
          <p className="font-semibold mt-2">Request:</p>
          <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400">
            <code>
              {`{
  "signer_email": "user@example.com",
  "document_url": "https://example.com/docs/contract.pdf",
  "redirect_url": "https://example.com/confirmation"
}`}
            </code>
          </pre>
          <p className="font-semibold mt-2">Response:</p>
          <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400">
            <code>
              {`{
  "request_id": "SIGN-001",
  "signing_url": "https://signatrust.com/sign/SIGN-001"
}`}
            </code>
          </pre>
        </div>

        {/* Get Signature Status */}
        <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
          <h3 className="text-lg font-semibold">2.2 Get Signature Status</h3>
          <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400 mt-2">
            <code>GET /signatures/{`{request_id}`}</code>
          </pre>
          <p className="font-semibold mt-2">Response:</p>
          <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400">
            <code>
              {`{
  "request_id": "SIGN-001",
  "status": "pending",
  "signer_email": "user@example.com",
  "signed_at": null
}`}
            </code>
          </pre>
        </div>
      </section>
    </main>
  );
}
