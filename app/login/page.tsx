// app/login/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  loginWithCredentials,
  loginWithDID,
  loginWithWallet,
} from "../lib/auth";
import { log, logError } from "../utils/client_logger";
import { generateChallenge } from "../utils/didUtils";
import { FEATURES } from "../config";

const LoginPage: React.FC = () => {
  const [loginMethod, setLoginMethod] = useState<
    "credentials" | "did" | "wallet"
  >("credentials");
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [did, setDid] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    log("info", "Login component mounted");
    return () => log("info", "Login component unmounted");
  }, []);

  const handleCredentialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleDIDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDid(e.target.value);
  };

  const handleCredentialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    log("info", "Credential login attempt", { username: credentials.username });

    try {
      const response = await loginWithCredentials(credentials);
      log("info", "Login successful", { username: credentials.username });
      router.push("/dashboard");
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logError(error, "Login failed");
      setError("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDIDLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    log("info", "DID login attempt", { did });

    if (!did.trim() || !isDIDValid(did)) {
      setError("Invalid DID format. Please enter a valid DID.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await loginWithDID(did);
      log("info", "DID login successful", { did });
      router.push("/dashboard");
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logError(error, "DID login failed");
      setError("Authentication failed. Please check your DID and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletLogin = async () => {
    setError("");
    setIsLoading(true);
    log("info", "Wallet login attempt");

    try {
      const response = await loginWithWallet();
      log("info", "Wallet login successful");
      router.push("/dashboard");
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logError(error, "Wallet login failed");
      setError(
        error.message || "Wallet authentication failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isDIDValid = (did: string) => {
    return /^did:[\w:]+$/.test(did);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Or{" "}
          <Link
            href="/register"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            register a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="flex justify-center space-x-2 mb-6">
            <button
              className={`px-3 py-2 rounded-md ${
                loginMethod === "credentials"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-700 text-gray-300"
              }`}
              onClick={() => setLoginMethod("credentials")}
            >
              Email & Password
            </button>
            <button
              className={`px-3 py-2 rounded-md ${
                loginMethod === "did"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-700 text-gray-300"
              }`}
              onClick={() => setLoginMethod("did")}
            >
              Digital ID
            </button>
            {FEATURES.ENABLE_WALLET_AUTH && (
              <button
                className={`px-3 py-2 rounded-md ${
                  loginMethod === "wallet"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
                onClick={() => setLoginMethod("wallet")}
              >
                Wallet
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-2 rounded-md mb-4">
              {error}
            </div>
          )}

          {loginMethod === "credentials" && (
            <form className="space-y-6" onSubmit={handleCredentialLogin}>
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-300"
                >
                  Email or Username
                </label>
                <div className="mt-1">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 bg-gray-700 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={credentials.username}
                    onChange={handleCredentialChange}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300"
                >
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 bg-gray-700 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={credentials.password}
                    onChange={handleCredentialChange}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded bg-gray-700"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-300"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-indigo-500 hover:text-indigo-400"
                  >
                    Forgot your password?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </button>
              </div>
            </form>
          )}

          {loginMethod === "did" && (
            <form className="space-y-6" onSubmit={handleDIDLogin}>
              <div>
                <label
                  htmlFor="did"
                  className="block text-sm font-medium text-gray-300"
                >
                  Digital ID (DID)
                </label>
                <div className="mt-1">
                  <input
                    id="did"
                    name="did"
                    type="text"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 bg-gray-700 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={did}
                    onChange={handleDIDChange}
                    placeholder="did:sol:..."
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isLoading ? "Authenticating..." : "Sign in with DID"}
                </button>
              </div>
            </form>
          )}

          {loginMethod === "wallet" && (
            <div className="space-y-6">
              <div className="bg-gray-700 p-4 rounded-md text-center">
                <p className="text-gray-300 mb-4">
                  Connect your blockchain wallet to sign in securely.
                </p>
                <button
                  onClick={handleWalletLogin}
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isLoading ? "Connecting..." : "Connect Wallet"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
