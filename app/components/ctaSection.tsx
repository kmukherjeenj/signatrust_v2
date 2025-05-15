import React from "react";
import { motion } from "framer-motion";

interface CTASectionProps {
  handleGetStarted?: () => void;
}

const CTASection: React.FC<CTASectionProps> = ({ handleGetStarted }) => {
  return (
    <section
      className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden"
      id="cta"
    >
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-primary-900/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-primary-900/20 rounded-full blur-3xl"></div>

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-700 relative overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary-500/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-primary-500/10 rounded-full blur-2xl"></div>

            <div className="relative">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Transform Your Document Workflow Today
                </h2>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  Join thousands of businesses that trust SignaTrust for secure,
                  compliant digital signatures and identity verification.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-gray-900/50 backdrop-blur p-6 rounded-xl border border-gray-700">
                  <div className="w-12 h-12 bg-primary-900/50 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-primary-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Quick Setup
                  </h3>
                  <p className="text-gray-300">
                    Get started in minutes with our intuitive onboarding
                    process. No complex installation required.
                  </p>
                </div>

                <div className="bg-gray-900/50 backdrop-blur p-6 rounded-xl border border-gray-700">
                  <div className="w-12 h-12 bg-primary-900/50 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-primary-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Enterprise Security
                  </h3>
                  <p className="text-gray-300">
                    Bank-level encryption and compliance features that meet the
                    highest industry standards.
                  </p>
                </div>

                <div className="bg-gray-900/50 backdrop-blur p-6 rounded-xl border border-gray-700">
                  <div className="w-12 h-12 bg-primary-900/50 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-primary-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Seamless Integration
                  </h3>
                  <p className="text-gray-300">
                    Connect with your existing tools and workflows through our
                    comprehensive API and pre-built integrations.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <button
                  onClick={handleGetStarted}
                  className="w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg text-lg shadow-lg transition-colors duration-300 flex items-center justify-center"
                >
                  Start Free Trial
                  <svg
                    className="ml-2 -mr-1 w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </button>

                <a
                  href="#demo"
                  className="w-full sm:w-auto px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg text-lg shadow-lg transition-colors duration-300 flex items-center justify-center"
                >
                  Request Demo
                  <svg
                    className="ml-2 -mr-1 w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </a>
              </div>

              <div className="flex items-center justify-center space-x-8">
                <div className="flex items-center">
                  <svg
                    className="text-primary-500 w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-300">No credit card required</span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="text-primary-500 w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-300">14-day free trial</span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="text-primary-500 w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-300">Cancel anytime</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Testimonial quote */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 text-center"
          >
            <blockquote className="text-xl italic text-gray-300 max-w-3xl mx-auto">
              "SignaTrust has been a game-changer for our business. We've
              reduced contract turnaround time by 80% while ensuring compliance
              with all regulations."
            </blockquote>
            <div className="mt-4">
              <p className="text-white font-medium">Alexandra Richards</p>
              <p className="text-gray-400">CEO, TechVentures Inc.</p>
            </div>
          </motion.div>

          {/* FAQ Teaser */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-16 text-center"
          >
            <p className="text-gray-300 mb-4">
              Have questions about SignaTrust?
            </p>
            <a
              href="#faq"
              className="text-primary-400 hover:text-primary-300 font-medium inline-flex items-center transition-colors duration-300"
            >
              Visit our FAQ
              <svg
                className="ml-2 w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
