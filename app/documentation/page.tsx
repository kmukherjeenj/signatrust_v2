"use client";

import { useState } from "react";

const apiMethods = [
  {
    category: "Authentication & Account Management",
    methods: [
      {
        name: "Authenticate User",
        endpoint: "POST /auth/login",
        description: "Authenticates a user via API key.",
        request: {
          headers: {
            Authorization: "Bearer {API_KEY}",
            "Content-Type": "application/json",
          },
          body: {
            email: "user@example.com",
            password: "password123",
          },
        },
        response: {
          user_id: "12345",
          token: "eyJhbGciOiJIUzI1NiIsInR5cCI...",
          expires_in: 3600,
        },
      },
      {
        name: "Link Loyalty Cloud Account",
        endpoint: "POST /users/link",
        description: "Links a SignaTrust account to a Loyalty Cloud user.",
        request: {
          body: {
            user_id: "12345",
            loyalty_cloud_id: "LC-98765",
          },
        },
        response: {
          status: "linked",
          linked_at: "2025-02-08T10:30:00Z",
        },
      },
    ],
  },
  {
    category: "Signature Requests",
    methods: [
      {
        name: "Send Signature Request",
        endpoint: "POST /signatures",
        description: "Creates a new signature request.",
        request: {
          body: {
            signer_email: "user@example.com",
            document_url: "https://loyaltycloud.com/docs/contract.pdf",
            redirect_url: "https://loyaltycloud.com/confirmation",
          },
        },
        response: {
          request_id: "SIGN-001",
          signing_url: "https://signatrust.com/sign/SIGN-001",
        },
      },
      {
        name: "Get Signature Status",
        endpoint: "GET /signatures/{request_id}",
        description: "Fetches the signature request status.",
        response: {
          request_id: "SIGN-001",
          status: "pending",
          signer_email: "user@example.com",
          signed_at: null,
        },
      },
    ],
  },
];

export default function ApiDocs() {
  const [selectedCategory, setSelectedCategory] = useState(apiMethods[0]);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">
        📜 SignaTrust API Documentation
      </h1>

      <div className="flex space-x-4 mb-6">
        {apiMethods.map((category) => (
          <button
            key={category.category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 border rounded ${
              selectedCategory.category === category.category
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            {category.category}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {selectedCategory.methods.map((method) => (
          <div
            key={method.endpoint}
            className="p-4 border rounded-lg bg-gray-50"
          >
            <h2 className="text-xl font-semibold">{method.name}</h2>
            <p className="text-gray-700">{method.description}</p>
            <p className="mt-2 text-sm font-mono bg-gray-200 p-2 rounded">
              🔗 {method.endpoint}
            </p>

            {method.request && (
              <div className="mt-4">
                <h3 className="text-md font-semibold">📤 Request</h3>
                <pre className="bg-gray-800 text-white p-3 rounded text-sm">
                  {JSON.stringify(method.request, null, 2)}
                </pre>
              </div>
            )}

            {method.response && (
              <div className="mt-4">
                <h3 className="text-md font-semibold">📥 Response</h3>
                <pre className="bg-gray-800 text-white p-3 rounded text-sm">
                  {JSON.stringify(method.response, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
