export default function DocumentationPage() {
  return (
    <main className="container mx-auto px-6 py-10 bg-white text-gray-900">
      {/* Header Section */}
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        SignaTrust API Documentation
      </h1>
      <p className="text-lg text-gray-700">v1.0</p>
      <p className="mt-2 text-gray-800">
        Learn how to integrate <strong>SignaTrust</strong> into your platform
        with easy-to-follow tutorials and examples.
      </p>

      {/* Base URL Section */}
      <div className="mt-6 p-4 bg-gray-200 rounded-lg border border-gray-300">
        <h2 className="text-xl font-semibold text-gray-900">Base URL</h2>
        <pre className="bg-gray-100 text-gray-900 p-3 rounded-lg border border-gray-400 mt-2">
          <code>https://api.signatrust.io/v1</code>
        </pre>
      </div>

      {/* Authentication Tutorial */}
      <section className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-900">
          1. Authentication Tutorial
        </h2>
        <p className="text-gray-700">
          Before making API calls, authenticate using your API key.
        </p>

        {/* Example: Authenticate User */}
        <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
          <h3 className="text-lg font-semibold">1.1 Authenticate User</h3>
          <p>Use the following request to log in:</p>

          <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400">
            <code>POST /auth/login</code>
          </pre>

          <p className="font-semibold mt-2">Headers:</p>
          <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400">
            <code>
              {`Authorization: Bearer {API_KEY}
Content-Type: application/json`}
            </code>
          </pre>

          <p className="font-semibold mt-2">Example Request (cURL):</p>
          <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400">
            <code>
              {`curl -X POST https://api.signatrust.io/v1/auth/login \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
            </code>
          </pre>

          <p className="font-semibold mt-2">Example in JavaScript (fetch):</p>
          <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400">
            <code>
              {`fetch("https://api.signatrust.io/v1/auth/login", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  }
}).then(response => response.json())
  .then(data => console.log(data));`}
            </code>
          </pre>
        </div>
      </section>

      {/* Signature Requests Tutorial */}
      <section className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-900">
          2. Sending a Signature Request
        </h2>
        <p className="text-gray-700">
          Learn how to send a document for signing.
        </p>

        {/* Example: Send Signature Request */}
        <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
          <h3 className="text-lg font-semibold">2.1 Send Signature Request</h3>
          <p>Use this API to request a signature from a user.</p>

          <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400">
            <code>POST /signatures</code>
          </pre>

          <p className="font-semibold mt-2">Example Request:</p>
          <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400">
            <code>
              {`{
  "signer_email": "user@example.com",
  "document_url": "https://yourplatform.com/docs/contract.pdf",
  "redirect_url": "https://yourplatform.com/confirmation"
}`}
            </code>
          </pre>

          <p className="font-semibold mt-2">Example in Node.js:</p>
          <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400">
            <code>
              {`const fetch = require("node-fetch");

const sendSignatureRequest = async () => {
  const response = await fetch("https://api.signatrust.io/v1/signatures", {
    method: "POST",
    headers: {
      "Authorization": "Bearer YOUR_API_KEY",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      signer_email: "user@example.com",
      document_url: "https://yourplatform.com/docs/contract.pdf",
      redirect_url: "https://yourplatform.com/confirmation"
    })
  });

  const data = await response.json();
  console.log(data);
};

sendSignatureRequest();`}
            </code>
          </pre>
        </div>
      </section>

      {/* Checking Signature Status */}
      <section className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-900">
          3. Checking Signature Status
        </h2>
        <p className="text-gray-700">
          Retrieve the current status of a signature request.
        </p>

        <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
          <h3 className="text-lg font-semibold">3.1 Get Signature Status</h3>
          <pre className="bg-gray-50 text-gray-900 p-3 rounded-lg border border-gray-400">
            <code>GET /signatures/{`{request_id}`}</code>
          </pre>

          <p className="font-semibold mt-2">Example Response:</p>
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
