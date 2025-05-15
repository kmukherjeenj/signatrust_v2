"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, X, AlertCircle } from "lucide-react";

interface PricingProps {
  handleGetStarted?: () => void;
}

const Pricing: React.FC<PricingProps> = ({ handleGetStarted }) => {
  return (
    <section
      id="pricing"
      className="py-24 bg-gradient-to-b from-gray-800 to-gray-900"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">
            Simple, Affordable Annual Pricing
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Just $50 per year - up to 90% cheaper than DocuSign with no hidden
            fees or monthly commitments.
          </p>
        </motion.div>

        {/* Price comparison with DocuSign */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-4xl mx-auto mb-16 bg-gray-800 rounded-xl overflow-hidden shadow-xl"
        >
          <div className="bg-gray-900 p-4 text-center">
            <h3 className="text-2xl font-bold">SignaTrust vs. DocuSign</h3>
            <p className="text-gray-400">
              See how much you could save annually
            </p>
          </div>

          <div className="grid grid-cols-3">
            <div className="p-4 border-b border-gray-700">
              <span className="text-gray-400">Feature</span>
            </div>
            <div className="p-4 border-b border-gray-700 text-center font-medium">
              <span className="text-purple-500">SignaTrust</span>
            </div>
            <div className="p-4 border-b border-gray-700 text-center font-medium">
              <span className="text-gray-300">DocuSign</span>
            </div>

            {/* Pricing Rows */}
            <div className="p-4 border-b border-gray-700">
              <span>Annual Cost</span>
            </div>
            <div className="p-4 border-b border-gray-700 text-center font-bold text-white">
              $50 per year
            </div>
            <div className="p-4 border-b border-gray-700 text-center text-gray-300">
              $480 per year
            </div>

            <div className="p-4 border-b border-gray-700">
              <span>Documents per year</span>
            </div>
            <div className="p-4 border-b border-gray-700 text-center text-white">
              300 included
            </div>
            <div className="p-4 border-b border-gray-700 text-center text-gray-300">
              60 included
            </div>

            <div className="p-4 border-b border-gray-700">
              <span>Additional documents</span>
            </div>
            <div className="p-4 border-b border-gray-700 text-center text-white">
              $0.25 each
            </div>
            <div className="p-4 border-b border-gray-700 text-center text-gray-300">
              $2.50 each
            </div>

            <div className="p-4 border-b border-gray-700">
              <span>Long-term commitment</span>
            </div>
            <div className="p-4 border-b border-gray-700 text-center text-green-500">
              <div className="flex items-center justify-center">
                <X className="w-5 h-5" />
                <span className="ml-1">None</span>
              </div>
            </div>
            <div className="p-4 border-b border-gray-700 text-center text-red-400">
              <div className="flex items-center justify-center">
                <Check className="w-5 h-5" />
                <span className="ml-1">Required</span>
              </div>
            </div>

            <div className="p-4 border-b border-gray-700">
              <span>Yearly savings</span>
            </div>
            <div className="p-4 border-b border-gray-700 text-center font-bold text-green-400">
              Save $430
            </div>
            <div className="p-4 border-b border-gray-700 text-center text-gray-300">
              —
            </div>
          </div>
        </motion.div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700"
          >
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">$0</span>
                <span className="text-gray-400 ml-2">forever</span>
              </div>
              <p className="text-gray-300 mb-6">
                Perfect for individual users trying SignaTrust
              </p>
              <button
                onClick={handleGetStarted}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition duration-300"
              >
                Sign Up Free
              </button>
            </div>
            <div className="border-t border-gray-700 p-6">
              <ul className="space-y-3">
                <PricingFeature>10 documents per month</PricingFeature>
                <PricingFeature>Basic document templates</PricingFeature>
                <PricingFeature>Email notifications</PricingFeature>
                <PricingFeature>2 signers per document</PricingFeature>
                <PricingFeature>7-day document storage</PricingFeature>
              </ul>
            </div>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gray-800 rounded-xl shadow-xl overflow-hidden border-2 border-purple-500 transform md:scale-105 z-10"
          >
            <div className="bg-purple-600 text-center py-2">
              <span className="text-sm font-medium">MOST POPULAR</span>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-2">Professional</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">$50</span>
                <span className="text-gray-400 ml-2">per year</span>
              </div>
              <p className="text-gray-300 mb-6">
                For professionals who need more capabilities
              </p>
              <button
                onClick={handleGetStarted}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition duration-300"
              >
                Start Free Trial
              </button>
            </div>
            <div className="border-t border-gray-700 p-6">
              <ul className="space-y-3">
                <PricingFeature>300 documents per year</PricingFeature>
                <PricingFeature>Advanced templates</PricingFeature>
                <PricingFeature>Priority verification</PricingFeature>
                <PricingFeature>Unlimited signers</PricingFeature>
                <PricingFeature>Custom branding</PricingFeature>
                <PricingFeature>1-year document storage</PricingFeature>
              </ul>
            </div>
          </motion.div>

          {/* Business Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700"
          >
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-2">Business</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">$150</span>
                <span className="text-gray-400 ml-2">per year</span>
              </div>
              <p className="text-gray-300 mb-6">
                For teams and businesses of all sizes
              </p>
              <button
                onClick={handleGetStarted}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition duration-300"
              >
                Contact Sales
              </button>
            </div>
            <div className="border-t border-gray-700 p-6">
              <ul className="space-y-3">
                <PricingFeature>Unlimited documents</PricingFeature>
                <PricingFeature>Team management (5 users)</PricingFeature>
                <PricingFeature>Custom workflows</PricingFeature>
                <PricingFeature>API access</PricingFeature>
                <PricingFeature>Advanced analytics</PricingFeature>
                <PricingFeature>Unlimited document storage</PricingFeature>
                <PricingFeature>Priority support</PricingFeature>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Annual Savings Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16 max-w-4xl mx-auto bg-purple-900/20 rounded-xl p-8 border border-purple-500/30"
        >
          <div className="flex flex-col md:flex-row items-center">
            <div className="bg-purple-600/20 p-4 rounded-full mb-4 md:mb-0 md:mr-6">
              <svg
                className="w-10 h-10 text-purple-500"
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
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Significant Annual Savings
              </h3>
              <p className="text-gray-300 mb-2">
                At just $50 per year, SignaTrust costs up to 90% less than
                traditional e-signature platforms, saving you hundreds of
                dollars annually.
              </p>
              <p className="text-gray-300">
                No monthly charges, no hidden fees, and no long-term commitments
                - just straightforward annual pricing.
              </p>
            </div>
          </div>
        </motion.div>

        {/* FAQ Teaser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-20 max-w-3xl mx-auto bg-gray-800 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-start">
            <div className="bg-purple-600/20 p-3 rounded-full mr-4">
              <AlertCircle className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Have questions about our annual pricing?
              </h3>
              <p className="text-gray-300 mb-4">
                One simple annual payment of $50 gives you access to all
                Professional features for an entire year. No surprise charges or
                hidden fees.
              </p>
              <a
                href="#faq"
                className="text-purple-400 hover:text-purple-300 inline-flex items-center"
              >
                View Frequently Asked Questions
                <svg
                  className="w-4 h-4 ml-2"
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
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const PricingFeature: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <li className="flex items-center text-gray-300">
      <Check className="w-5 h-5 text-purple-500 mr-2 flex-shrink-0" />
      <span>{children}</span>
    </li>
  );
};

export default Pricing;
