import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BuildingOfficeIcon,
  ScaleIcon,
  BanknotesIcon,
  HomeModernIcon,
  UserGroupIcon,
  DocumentCheckIcon,
} from "@heroicons/react/24/outline";

interface UseCase {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  benefits: string[];
  example: string;
  image: string;
}

const UseCases: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("legal");

  const useCases: UseCase[] = [
    {
      id: "legal",
      title: "Legal Services",
      description:
        "Streamline document workflows for law firms and legal departments with secure, legally-binding signatures that comply with regulations worldwide.",
      icon: <ScaleIcon className="w-6 h-6" />,
      benefits: [
        "Reduce contract turnaround time by up to 80%",
        "Maintain legal compliance with audit trails",
        "Secure client identity verification",
        "Integrate with case management systems",
      ],
      example:
        "A mid-size law firm reduced their contract processing time from 7 days to just 2 hours while ensuring compliance with bar association requirements.",
      image: "/images/use-cases/legal.jpg",
    },
    {
      id: "finance",
      title: "Financial Services",
      description:
        "Meet regulatory requirements while accelerating financial processes. Our KYC integration ensures compliance with financial regulations.",
      icon: <BanknotesIcon className="w-6 h-6" />,
      benefits: [
        "Compliant with financial regulations including KYC/AML",
        "Secure document handling for sensitive financial information",
        "Integrated identity verification",
        "Automated compliance reporting",
      ],
      example:
        "A regional bank reduced customer onboarding time from 5 days to 20 minutes, resulting in 35% higher customer satisfaction scores.",
      image: "/images/use-cases/finance.jpg",
    },
    {
      id: "real-estate",
      title: "Real Estate",
      description:
        "Close deals faster with remote signing capabilities while maintaining security and compliance for all property transactions.",
      icon: <HomeModernIcon className="w-6 h-6" />,
      benefits: [
        "Close property deals from anywhere, anytime",
        "Reduce paperwork errors with guided signing",
        "Secure identity verification for all parties",
        "Streamlined agent-client collaboration",
      ],
      example:
        "A real estate brokerage increased their closing rate by 23% by enabling remote document signing for out-of-state buyers.",
      image: "/images/use-cases/real-estate.jpg",
    },
    {
      id: "enterprise",
      title: "Enterprise",
      description:
        "Modernize corporate document workflows with enterprise-grade security and compliance features for businesses of all sizes.",
      icon: <BuildingOfficeIcon className="w-6 h-6" />,
      benefits: [
        "Centralized document management",
        "Role-based permissions and approvals",
        "Integration with enterprise systems (SAP, Salesforce, etc.)",
        "Advanced security controls and compliance features",
      ],
      example:
        "A Fortune 500 company saved $1.2M annually by digitizing their contract approval process while maintaining regulatory compliance.",
      image: "/images/use-cases/enterprise.jpg",
    },
    {
      id: "healthcare",
      title: "Healthcare",
      description:
        "Secure, HIPAA-compliant document signing for healthcare providers, insurance companies, and patients.",
      icon: <UserGroupIcon className="w-6 h-6" />,
      benefits: [
        "HIPAA compliance for all medical documents",
        "Secure patient identity verification",
        "Integration with EHR/EMR systems",
        "Streamlined insurance processing",
      ],
      example:
        "A healthcare network reduced patient intake time by 67% while ensuring HIPAA compliance for all documentation.",
      image: "/images/use-cases/healthcare.jpg",
    },
    {
      id: "hr",
      title: "Human Resources",
      description:
        "Accelerate onboarding and streamline employee documentation with secure, compliant digital signatures.",
      icon: <DocumentCheckIcon className="w-6 h-6" />,
      benefits: [
        "Faster employee onboarding and documentation",
        "Compliant storage of employment records",
        "Streamlined benefits enrollment",
        "Integration with HRIS systems",
      ],
      example:
        "An HR department reduced onboarding paperwork time from 2 days to 30 minutes, improving new hire satisfaction and productivity.",
      image: "/images/use-cases/hr.jpg",
    },
  ];

  const activeUseCase =
    useCases.find((uc) => uc.id === activeTab) || useCases[0];

  return (
    <section className="py-24 bg-gray-800" id="use-cases">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-white mb-4"
          >
            Industry Solutions
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            SignaTrust adapts to your industry's specific requirements with
            tailored solutions that ensure compliance and efficiency.
          </motion.p>
        </div>

        {/* Tabs */}
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            {useCases.map((useCase) => (
              <button
                key={useCase.id}
                onClick={() => setActiveTab(useCase.id)}
                className={`px-4 sm:px-6 py-3 rounded-full flex items-center text-sm sm:text-base transition-colors duration-300 ${
                  activeTab === useCase.id
                    ? "bg-primary-600 text-white"
                    : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                }`}
              >
                <span className="mr-2">{useCase.icon}</span>
                {useCase.title}
              </button>
            ))}
          </div>
        </div>

        {/* Active use case content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-900 rounded-2xl overflow-hidden shadow-xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-8 lg:p-10 order-2 lg:order-1">
              <h3 className="text-2xl font-bold text-white mb-4">
                {activeUseCase.title}
              </h3>
              <p className="text-gray-300 mb-6">{activeUseCase.description}</p>

              <h4 className="font-semibold text-primary-400 mb-3">
                Key Benefits
              </h4>
              <ul className="space-y-3 mb-8">
                {activeUseCase.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="h-5 w-5 text-primary-500 mt-0.5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-300">{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-primary-500">
                <h4 className="font-semibold text-white mb-2">Success Story</h4>
                <p className="text-gray-300 italic">{activeUseCase.example}</p>
              </div>
            </div>

            <div className="lg:order-2 h-64 lg:h-auto bg-gray-700 relative">
              {/* Placeholder for the image */}
              <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                <span className="text-gray-500 text-sm">
                  Image: {activeUseCase.title}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <a
            href="#contact"
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-300"
          >
            Talk to an Industry Specialist
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="ml-2 -mr-1 h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default UseCases;
