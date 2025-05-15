// Environment variables with fallbacks
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
export const WEBSITE_URL =
  process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000";

// Feature flags
export const FEATURES = {
  ENABLE_WALLET_AUTH:
    process.env.NEXT_PUBLIC_ENABLE_WALLET_AUTH === "true" || false,
  ENABLE_PASSWORDLESS:
    process.env.NEXT_PUBLIC_ENABLE_PASSWORDLESS === "true" || true,
};

// Application settings
export const APP_SETTINGS = {
  COMPANY_NAME: "SignaTrust",
  SUPPORT_EMAIL: "support@signatrust.io",
  MAX_UPLOAD_SIZE: 10 * 1024 * 1024, // 10MB in bytes
  SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
};

// API endpoints
export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    SESSION: "/auth/session",
    WALLET_NONCE: "/auth/wallet/nonce",
    WALLET_VERIFY: "/auth/wallet/verify",
    WALLET_CONNECT: "/auth/wallet/connect",
  },
  USER: {
    PROFILE: "/user/profile",
  },
  KYC: {
    STATUS: "/kyc",
    VERIFY: "/kyc/verify",
    VERIFICATION_STATUS: "/kyc/status",
  },
  DOCUMENTS: {
    LIST: "/documents",
    UPLOAD: "/documents/upload",
    SIGN: "/documents/sign",
  },
};

// Routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  DOCUMENTS: "/documents",
  KYC: "/kyc",
  SIGN: "/sign",
  PROFILE: "/profile",
  SETTINGS: "/settings",
};
