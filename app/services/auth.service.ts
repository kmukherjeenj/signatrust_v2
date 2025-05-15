import { API_URL, ENDPOINTS } from "../config";

// Check if the user is authenticated
export const checkSession = async () => {
  try {
    const response = await fetch(`${API_URL}${ENDPOINTS.AUTH.SESSION}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.authenticated;
  } catch (error) {
    console.error("Session check error:", error);
    return false;
  }
};

// Login with email and password
export const login = async (email: string, password: string) => {
  try {
    const response = await fetch(`${API_URL}${ENDPOINTS.AUTH.LOGIN}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }

    return {
      success: true,
      user: data.identity,
      token: data.token,
    };
  } catch (error: any) {
    console.error("Login error:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

// Login with crypto wallet
export const loginWithWallet = async () => {
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
    const nonceResponse = await fetch(
      `${API_URL}${ENDPOINTS.AUTH.WALLET_NONCE}?address=${address}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    const nonceData = await nonceResponse.json();

    if (!nonceResponse.ok) {
      throw new Error(nonceData.error || "Failed to get authentication nonce");
    }

    // Sign the nonce
    const message = `SignaTrust Authentication\nNonce: ${nonceData.nonce}`;
    const signature = await ethereum.request({
      method: "personal_sign",
      params: [message, address],
    });

    // Verify signature and login
    const loginResponse = await fetch(
      `${API_URL}${ENDPOINTS.AUTH.WALLET_VERIFY}`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
          signature,
          nonce: nonceData.nonce,
        }),
      }
    );

    const loginData = await loginResponse.json();

    if (!loginResponse.ok) {
      throw new Error(loginData.error || "Wallet authentication failed");
    }

    return {
      success: true,
      user: loginData.identity,
      token: loginData.token,
    };
  } catch (error: any) {
    console.error("Wallet login error:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

// Register a new user
export const register = async (userData: {
  email: string;
  password: string;
  name: string;
}) => {
  try {
    const response = await fetch(`${API_URL}${ENDPOINTS.AUTH.REGISTER}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Registration failed");
    }

    return {
      success: true,
      message: data.message,
    };
  } catch (error: any) {
    console.error("Registration error:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

// Logout user
export const logout = async () => {
  try {
    const response = await fetch(`${API_URL}${ENDPOINTS.AUTH.LOGOUT}`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Logout failed");
    }

    return { success: true };
  } catch (error: any) {
    console.error("Logout error:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

// Connect wallet to existing account
export const connectWallet = async () => {
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
    const nonceResponse = await fetch(
      `${API_URL}${ENDPOINTS.AUTH.WALLET_NONCE}?address=${address}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    const nonceData = await nonceResponse.json();

    if (!nonceResponse.ok) {
      throw new Error(nonceData.error || "Failed to get authentication nonce");
    }

    // Sign the nonce
    const message = `SignaTrust Wallet Connection\nNonce: ${nonceData.nonce}`;
    const signature = await ethereum.request({
      method: "personal_sign",
      params: [message, address],
    });

    // Link wallet to account
    const linkResponse = await fetch(
      `${API_URL}${ENDPOINTS.AUTH.WALLET_CONNECT}`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
          signature,
          nonce: nonceData.nonce,
        }),
      }
    );

    const linkData = await linkResponse.json();

    if (!linkResponse.ok) {
      throw new Error(linkData.error || "Wallet connection failed");
    }

    return {
      success: true,
      message: linkData.message,
    };
  } catch (error: any) {
    console.error("Wallet connection error:", error);
    return {
      success: false,
      message: error.message,
    };
  }
};

// Get user profile
export const getUserProfile = async () => {
  try {
    const response = await fetch(`${API_URL}${ENDPOINTS.USER.PROFILE}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user profile");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Profile fetch error:", error);
    throw error;
  }
};
