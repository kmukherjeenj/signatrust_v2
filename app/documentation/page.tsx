export default function DocumentationPage() {
  return (
    <main className="container mx-auto px-6 py-10 bg-white text-gray-900">
      {/* Header Section */}
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        SignaTrust API Documentation
      </h1>
      <p className="text-lg text-gray-700">Version 1.0</p>
      <p className="mt-2 text-gray-800">
        This API enables seamless integration of SignaTrust's digital signing
        solutions into any platform.
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

        {/* Register New Account */}
        <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
          <h3 className="text-lg font-semibold">1.2 Register New Account</h3>
          <p>Create a new SignaTrust account.</p>
          <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400 mt-2">
            <code>POST /auth/register</code>
          </pre>
          <p className="font-semibold mt-2">Request Body:</p>
          <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400">
            <code>
              {`{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe"
}`}
            </code>
          </pre>
          <p className="font-semibold mt-2">Response:</p>
          <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400">
            <code>
              {`{
  "user_id": "12345",
  "status": "created"
}`}
            </code>
          </pre>
        </div>

        {/* Update Account Information */}
        <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
          <h3 className="text-lg font-semibold">
            1.3 Update Account Information
          </h3>
          <p>Modify user account details.</p>
          <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400 mt-2">
            <code>PUT /users/{`{user_id}`}</code>
          </pre>
          <p className="font-semibold mt-2">Request Body:</p>
          <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400">
            <code>
              {`{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890"
}`}
            </code>
          </pre>
          <p className="font-semibold mt-2">Response:</p>
          <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400">
            <code>
              {`{
  "status": "updated",
  "updated_at": "2025-02-10T12:00:00Z"
}`}
            </code>
          </pre>
        </div>

        {/* Delete Account */}
        <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
          <h3 className="text-lg font-semibold">1.4 Delete Account</h3>
          <p>Delete a user account permanently.</p>
          <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400 mt-2">
            <code>DELETE /users/{`{user_id}`}</code>
          </pre>
          <p className="font-semibold mt-2">Response:</p>
          <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400">
            <code>
              {`{
  "status": "deleted",
  "deleted_at": "2025-02-10T12:05:00Z"
}`}
            </code>
          </pre>
        </div>
      </section>

      {/* Additional Sections */}
      {/* Signature Requests, Documents, Webhooks, & More Would Follow... */}
    </main>
  );
}
