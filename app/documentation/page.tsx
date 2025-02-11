export default function DocumentationPage() {
  return (
    <main className="container mx-auto px-6 py-10">
      {/* Header Section */}
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        SignaTrust API Documentation
      </h1>
      <p className="text-lg text-gray-600">Draft v1.0</p>
      <p className="mt-2 text-gray-700">
        This documentation outlines the core API methods required for{" "}
        <strong>stake.rent</strong> to integrate <strong>SignaTrust</strong>{" "}
        into Loyalty Cloud.
      </p>

      {/* Base URL Section */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-800">Base URL</h2>
        <pre className="bg-gray-900 text-white p-3 rounded-lg mt-2">
          <code>https://api.signatrust.com/v1</code>
        </pre>
      </div>

      {/* Authentication & Account Management */}
      <section className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-800">
          1. Authentication & Account Management
        </h2>
        <p className="text-gray-600">
          Manages user authentication, account linking, and permissions.
        </p>

        {/* Authenticate User */}
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold">1.1 Authenticate User</h3>
          <p>Authenticates a user via API key or OAuth.</p>
          <pre className="bg-gray-900 text-white p-3 rounded-lg mt-2">
            <code>POST /auth/login</code>
          </pre>
          <p className="font-semibold mt-2">Headers:</p>
          <pre className="bg-gray-900 text-white p-3 rounded-lg">
            <code>
              {`Authorization: Bearer {API_KEY}
Content-Type: application/json`}
            </code>
          </pre>
          <p className="font-semibold mt-2">Response:</p>
          <pre className="bg-gray-900 text-white p-3 rounded-lg">
            <code>
              {`{
  "user_id": "12345",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI...",
  "expires_in": 3600
}`}
            </code>
          </pre>
        </div>

        {/* Link Loyalty Cloud Account */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold">
            1.2 Link Loyalty Cloud Account
          </h3>
          <p>Links a SignaTrust account to a Loyalty Cloud user.</p>
          <pre className="bg-gray-900 text-white p-3 rounded-lg">
            <code>POST /users/link</code>
          </pre>
          <p className="font-semibold mt-2">Request:</p>
          <pre className="bg-gray-900 text-white p-3 rounded-lg">
            <code>
              {`{
  "user_id": "12345",
  "loyalty_cloud_id": "LC-98765"
}`}
            </code>
          </pre>
          <p className="font-semibold mt-2">Response:</p>
          <pre className="bg-gray-900 text-white p-3 rounded-lg">
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
        <h2 className="text-2xl font-semibold text-gray-800">
          2. Signature Requests
        </h2>
        <p className="text-gray-600">Manages document signing workflows.</p>

        {/* Send Signature Request */}
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold">2.1 Send Signature Request</h3>
          <p>Creates a new signature request.</p>
          <pre className="bg-gray-900 text-white p-3 rounded-lg">
            <code>POST /signatures</code>
          </pre>
          <p className="font-semibold mt-2">Request:</p>
          <pre className="bg-gray-900 text-white p-3 rounded-lg">
            <code>
              {`{
  "signer_email": "user@example.com",
  "document_url": "https://loyaltycloud.com/docs/contract.pdf",
  "redirect_url": "https://loyaltycloud.com/confirmation"
}`}
            </code>
          </pre>
          <p className="font-semibold mt-2">Response:</p>
          <pre className="bg-gray-900 text-white p-3 rounded-lg">
            <code>
              {`{
  "request_id": "SIGN-001",
  "signing_url": "https://signatrust.com/sign/SIGN-001"
}`}
            </code>
          </pre>
        </div>

        {/* Get Signature Status */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold">2.2 Get Signature Status</h3>
          <p>Retrieves the status of a signature request.</p>
          <pre className="bg-gray-900 text-white p-3 rounded-lg">
            <code>GET /signatures/{`{request_id}`}</code>
          </pre>
          <p className="font-semibold mt-2">Response:</p>
          <pre className="bg-gray-900 text-white p-3 rounded-lg">
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

      {/* Documents & Templates */}
      <section className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-800">
          3. Documents & Templates
        </h2>
        <p className="text-gray-600">Handles document storage and templates.</p>

        {/* Upload Document */}
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold">3.1 Upload Document</h3>
          <p>Uploads a document for signing.</p>
          <pre className="bg-gray-900 text-white p-3 rounded-lg">
            <code>POST /documents</code>
          </pre>
          <p className="font-semibold mt-2">Request:</p>
          <pre className="bg-gray-900 text-white p-3 rounded-lg">
            <code>
              {`{
  "file": "base64_encoded_file_data"
}`}
            </code>
          </pre>
        </div>
      </section>
    </main>
  );
}
