"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";

interface HeroProps {
  handleGetStarted?: () => void;
}

const Hero: React.FC<HeroProps> = ({ handleGetStarted }) => {
  return (
    <section className="bg-gradient-to-b from-gray-900 to-gray-800 py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              A <span className="text-purple-500">Better</span> Way to Handle
              Document Signing
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0">
              SignaTrust delivers secure, compliant digital signatures at just
              $50 per year — up to 90% cheaper than traditional solutions. Save
              time, reduce paperwork, and close deals faster.
            </p>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGetStarted}
                className="bg-purple-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-purple-700 transition duration-300 flex items-center justify-center"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </motion.button>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="#demo-video"
                className="bg-gray-700 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-600 transition duration-300 flex items-center justify-center"
              >
                Watch Demo
              </motion.a>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-3 sm:space-y-0">
              <div className="flex items-center mr-8">
                <CheckCircle className="text-purple-500 mr-2 w-5 h-5" />
                <span className="text-gray-300">No credit card required</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="text-purple-500 mr-2 w-5 h-5" />
                <span className="text-gray-300">Just $50 per year</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:w-1/2"
          >
            <div className="relative">
              {/* Main image */}
              <div className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700">
                <img
                  src="/images/hero-dashboard.png"
                  alt="SignaTrust Dashboard"
                  className="rounded-lg w-full"
                  // Placeholder if image doesn't exist yet
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "https://via.placeholder.com/800x500?text=SignaTrust+Dashboard";
                  }}
                />
              </div>

              {/* Floating elements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="absolute -bottom-6 -left-6 bg-gray-800 px-4 py-3 rounded-lg shadow-lg border border-purple-500/30"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center mr-3">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium">Document signed!</p>
                    <p className="text-xs text-gray-400">2 seconds ago</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="absolute -top-6 -right-6 bg-gray-800 px-4 py-3 rounded-lg shadow-lg border border-purple-500/30"
              >
                <div className="flex items-center">
                  <div className="text-right">
                    <p className="text-white font-medium">90% Cheaper</p>
                    <p className="text-xs text-gray-400">than DocuSign</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center ml-3">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
