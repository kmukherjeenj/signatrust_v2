"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Import components
import Header from "./components/common/header";
import Hero from "./components/Hero";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import SecuritySection from "./components/securitySection";
import UseCases from "./components/useCases";
import Testimonials from "./components/testimonials";
import Pricing from "./components/Pricing";
import CTASection from "./components/ctaSection";
import Footer from "./components/common/footer";

// Dynamically import auth service to avoid hydration issues
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // For development without a backend, just simulate a check
        if (
          typeof window !== "undefined" &&
          process.env.NODE_ENV === "development" &&
          process.env.NEXT_PUBLIC_USE_MOCK_API === "true"
        ) {
          setTimeout(() => {
            setIsLoading(false);
            setIsAuthenticated(false);
          }, 500);
          return;
        }

        // With a real backend
        const { checkSession } = await import("./services/auth.service");
        const authenticated = await checkSession();
        setIsAuthenticated(authenticated);
      } catch (error) {
        console.error("Session validation error:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { isAuthenticated, isLoading };
};

const HomePage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleGetStarted = () => {
    router.push("/register");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header handleGetStarted={handleGetStarted} />
      <main>
        <Hero handleGetStarted={handleGetStarted} />
        <Features />
        <HowItWorks />
        <SecuritySection />
        <UseCases />
        <Testimonials />
        <Pricing handleGetStarted={handleGetStarted} />
        <CTASection handleGetStarted={handleGetStarted} />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
