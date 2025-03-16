"use client";

import React from "react";
import Link from "next/link";
import Head from "next/head";

export default function GuidesPage() {
  return (
    <>
      <Head>
        <title>Guides &amp; How-Tos - SignaTrust</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="container mx-auto px-6 py-10 bg-white text-gray-900">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Guides &amp; How-Tos
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          Explore our comprehensive guides to help you integrate and optimize
          your SignaTrust API experience.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-2">Getting Started</h2>
            <p className="mb-4">
              Learn how to set up your environment, authenticate with our API,
              and make your first request.
            </p>
            <Link href="/guides/getting-started">
              <a className="text-purple-600 font-bold">Read More &rarr;</a>
            </Link>
          </div>
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-2">
              Integration Best Practices
            </h2>
            <p className="mb-4">
              Discover best practices for integrating the SignaTrust API
              securely and efficiently.
            </p>
            <Link href="/guides/integration-best-practices">
              <a className="text-purple-600 font-bold">Read More &rarr;</a>
            </Link>
          </div>
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-2">Troubleshooting</h2>
            <p className="mb-4">
              Find solutions to common issues and learn how to debug your
              integration effectively.
            </p>
            <Link href="/guides/troubleshooting">
              <a className="text-purple-600 font-bold">Read More &rarr;</a>
            </Link>
          </div>
          <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-2">Advanced Use Cases</h2>
            <p className="mb-4">
              Explore advanced topics like blockchain security, zero-knowledge
              proofs, and Web3 integration for digital signatures.
            </p>
            <Link href="/guides/advanced-use-cases">
              <a className="text-purple-600 font-bold">Read More &rarr;</a>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
