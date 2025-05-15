import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheckIcon,
  LockClosedIcon,
  FingerPrintIcon,
  ServerIcon,
} from "@heroicons/react/24/outline";

const SecuritySection: React.FC = () => {
  const securityFeatures = [
    {
      title: "End-to-End Encryption",
      description:
        "All documents and communications are secured with military-grade encryption, ensuring your data remains private and protected.",
      icon: <LockClosedIcon className="w-10 h-10 text-primary-400" />,
    },
    {
      title: "Identity Verification",
      description:
        "Our advanced KYC protocols verify the identity of all signatories, preventing fraud and ensuring regulatory compliance.",
      icon: <FingerPrintIcon className="w-10 h-10 text-primary-400" />,
    },
    {
      title: "Blockchain Verification",
      description:
        "Each signature is cryptographically secured and stored on the blockchain, creating an immutable audit trail.",
      icon: <ServerIcon className="w-10 h-10 text-primary-400" />,
    },
    {
      title: "Compliance Standards",
      description:
        "SignaTrust meets global compliance standards including GDPR, eIDAS, ESIGN Act, and UETA requirements.",
      icon: <ShieldCheckIcon className="w-10 h-10 text-primary-400" />,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <section
      className="py-24 bg-gray-900 relative overflow-hidden"
      id="security"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full grid grid-cols-10 gap-4">
          {Array.from({ length: 200 }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary-500"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.1,
              }}
            />
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-white mb-4"
          >
            Enterprise-Grade Security
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            Your documents and identity data deserve the highest level of
            protection. Our platform is built with security as the foundation.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {securityFeatures.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-gray-800 border border-gray-700 rounded-xl p-8 hover:border-primary-500 transition-colors duration-300 group"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-gray-700 p-3 rounded-lg group-hover:bg-primary-500/20 transition-colors duration-300">
                  {feature.icon}
                </div>
                <div className="ml-5">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center px-6 py-3 border border-gray-700 rounded-full text-sm text-gray-300">
            <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span>
            SOC 2 Type II Certified & GDPR Compliant
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="mt-12 bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700"
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-6">
              <h3 className="text-2xl font-bold text-white mb-2">
                Security Whitepaper
              </h3>
              <p className="text-gray-300">
                Learn more about our comprehensive security measures and
                compliance standards in our detailed whitepaper.
              </p>
            </div>
            <a
              href="#download-whitepaper"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-gray-900 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-300"
            >
              Download Whitepaper
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="ml-2 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SecuritySection;
