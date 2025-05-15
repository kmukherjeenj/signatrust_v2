// lib/auth.ts
import api from "./api";
//import { createIdentity, login as verifyIdentity } from "./identityUtils";
//import { generateChallenge, signChallenge, generateZKProof } from "./didUtils"; // your utility methods

export interface UserData {
  email: string;
  full_name?: string;
  password?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  user_id: string;
  token: string;
  expires_in: number;
}

export interface RegisterResponse {
  user_id: string;
  status: string;
  created_at: string;
}

export interface IdentityResponse {
  did: string;
  publicKey: string;
}

// Register new user
export async function registerUser(
  userData: UserData
): Promise<RegisterResponse> {
  try {
    const response = await api.post("/users/register", userData);
    return response.data;
  } catch (error) {
    console.error("Error registering user:", error);
    throw new Error("Failed to register user");
  }
}

// Create account with identity
export async function createAccount(
  userData: UserData
): Promise<IdentityResponse> {
  try {
    // Register user in database
    const resUser = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    if (!resUser.ok) throw new Error("User registration failed");

    const userDataJson = await resUser.json();

    // Create DID identity
    const resIdentity = await fetch("/api/identity/create", {
      method: "POST",
    });

    if (!resIdentity.ok) throw new Error("Identity creation failed");

    const identity = await resIdentity.json();

    // Optionally link user_id and DID (if backend supports this)
    await fetch("/api/identity/link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userDataJson.user_id,
        did: identity.did,
      }),
    });

    return {
      did: identity.did,
      publicKey: identity.publicKey,
    };
  } catch (error) {
    console.error("Account creation error:", error);
    throw new Error("Failed to create account");
  }
}

// Login with username and password
export async function loginWithCredentials(
  credentials: LoginCredentials
): Promise<AuthResponse> {
  try {
    const response = await api.post("/auth/login", credentials);

    // Store token in localStorage
    localStorage.setItem("authToken", response.data.token);
    sessionStorage.setItem("userDID", response.data.identity.did);

    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw new Error("Failed to login");
  }
}

export async function loginWithDID(did: string): Promise<AuthResponse> {
  try {
    // 1. Fetch challenge (nonce) from backend
    const challengeRes = await fetch(
      `/api/auth/challenge?did=${encodeURIComponent(did)}`
    );
    if (!challengeRes.ok)
      throw new Error("Failed to get challenge from backend");

    const { challenge } = await challengeRes.json();

    // 2. Sign challenge with wallet (e.g., Phantom)
    const messageBytes = new TextEncoder().encode(challenge);
    const wallet = (window as any).solana;

    if (!wallet || !wallet.isPhantom) {
      throw new Error(
        "Phantom wallet not found. Please install or connect it."
      );
    }

    const signed = await wallet.signMessage(messageBytes, "utf8");
    const signatureHex = Buffer.from(signed.signature).toString("hex");

    // 3. Send DID, signature, and challenge to backend
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        did,
        signature: signatureHex,
        challenge,
      }),
    });

    if (!res.ok) throw new Error("Login failed");

    // 4. Store returned token and DID
    const data = await res.json();
    localStorage.setItem("authToken", data.token);
    sessionStorage.setItem("userDID", data.identity.did);

    return data;
  } catch (error) {
    console.error("DID login error:", error);
    throw new Error("Failed to login with DID");
  }
}

// Login with wallet
export async function loginWithWallet(): Promise<AuthResponse> {
  try {
    // Check if window is defined (client-side)
    if (typeof window === "undefined") {
      throw new Error("This method can only be used in the browser");
    }

    // Check if ethereum object exists
    const ethereum = (window as any).ethereum;

    // Check if wallet is available
    if (!ethereum) {
      throw new Error(
        "No crypto wallet found. Please install MetaMask or another provider."
      );
    }

    // Request account access
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    const address = accounts[0];

    // Get nonce from server
    const nonceResponse = await api.get(
      `/auth/wallet/nonce?address=${address}`
    );
    const nonce = nonceResponse.data.nonce;

    // Sign the nonce
    const message = `SignaTrust Authentication\nNonce: ${nonce}`;
    const signature = await ethereum.request({
      method: "personal_sign",
      params: [message, address],
    });

    // Verify signature and login
    const response = await api.post("/auth/wallet/verify", {
      address,
      signature,
      nonce,
    });

    if (response.data && response.data.token) {
      // Store token and user data
      localStorage.setItem("authToken", response.data.token);
      sessionStorage.setItem("userDID", response.data.identity.did);

      return response.data;
    } else {
      throw new Error("Invalid response from server");
    }
  } catch (error) {
    console.error("Error logging in with wallet:", error);
    throw new Error("Failed to login with wallet");
  }
}

// Logout user
export async function logout(): Promise<void> {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    localStorage.removeItem("authToken");
    const did = sessionStorage.getItem("userDID");
    if (did) {
      localStorage.removeItem(`${did}_proof`);
      localStorage.removeItem(`${did}_publicSignals`);
      localStorage.removeItem(`${did}_challenge`);
    }
    sessionStorage.removeItem("userDID");
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return !!localStorage.getItem("authToken");
}

// Get current user info
export async function getCurrentUser() {
  try {
    const response = await api.get("/user/profile");
    return response.data;
  } catch (error) {
    console.error("Error fetching current user:", error);
    throw new Error("Failed to fetch user information");
  }
}
