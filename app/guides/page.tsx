import React from "react";
import Link from "next/link";
import Head from "next/head";

export default function GuidesPage() {
  return (
    <>
      <Head>
        <title>SignaTrust Guides & How-Tos</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="container">
        <h1>Guides &amp; How-Tos</h1>
        <p>
          Explore our comprehensive guides to help you integrate and optimize
          your SignaTrust API experience.
        </p>
        <div className="guide-list">
          <div className="guide-card">
            <h2>Getting Started</h2>
            <p>
              Learn how to set up your environment, authenticate with our API,
              and make your first request.
            </p>
            <Link href="/guides/getting-started">
              <a>Read More &rarr;</a>
            </Link>
          </div>
          <div className="guide-card">
            <h2>Integration Best Practices</h2>
            <p>
              Discover the best practices for integrating the SignaTrust API
              securely and efficiently.
            </p>
            <Link href="/guides/integration-best-practices">
              <a>Read More &rarr;</a>
            </Link>
          </div>
          <div className="guide-card">
            <h2>Troubleshooting</h2>
            <p>
              Find solutions to common issues, learn how to debug your
              integration, and optimize API performance.
            </p>
            <Link href="/guides/troubleshooting">
              <a>Read More &rarr;</a>
            </Link>
          </div>
          <div className="guide-card">
            <h2>Advanced Use Cases</h2>
            <p>
              Explore advanced topics like blockchain security, zero-knowledge
              proofs, and Web3 integration for digital signatures.
            </p>
            <Link href="/guides/advanced-use-cases">
              <a>Read More &rarr;</a>
            </Link>
          </div>
        </div>
      </main>
      <style jsx>{`
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Helvetica, Arial, sans-serif;
        }
        h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          text-align: center;
        }
        p {
          text-align: center;
          color: #4b5563;
        }
        .guide-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }
        .guide-card {
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 1.5rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .guide-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .guide-card h2 {
          margin-top: 0;
          font-size: 1.5rem;
          color: #111827;
        }
        .guide-card p {
          color: #4b5563;
          margin: 0.5rem 0 1rem;
        }
        .guide-card a {
          color: #9333ea;
          font-weight: bold;
          text-decoration: none;
        }
      `}</style>
    </>
  );
}
