import React from 'react';
import { motion } from 'framer-motion';

const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="container mx-auto px-4 py-16 bg-gray-800">
      <h2 className="text-4xl font-bold mb-12 text-center">How It Works</h2>
      <div className="max-w-3xl mx-auto">
        <ol className="relative border-l border-gray-700">
          {steps.map((step, index) => (
            <Step key={index} {...step} isLast={index === steps.length - 1} />
          ))}
        </ol>
      </div>
    </section>
  )
}

interface StepProps {
  number: number;
  title: string;
  description: string;
  isLast?: boolean;
}

const Step: React.FC<StepProps> = ({ number, title, description, isLast = false }) => {
  return (
    <motion.li
      className={`${isLast ? '' : 'mb-10'} ml-6`}
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: number * 0.1 }}
      viewport={{ once: true }}
    >
      <span className="absolute flex items-center justify-center w-8 h-8 bg-purple-600 rounded-full -left-4 ring-4 ring-gray-900 text-white">
        {number}
      </span>
      <h3 className="font-semibold text-xl mb-1">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </motion.li>
  )
}

const steps: StepProps[] = [
  { number: 1, title: "Upload Document", description: "Securely upload your document to our platform." },
  { number: 2, title: "Add Signatories", description: "Invite required signatories via email or secure link." },
  { number: 3, title: "Sign with Blockchain", description: "Signatories sign using our blockchain-powered solution." },
  { number: 4, title: "Verify & Store", description: "Document is verified with zkProofs and securely stored." }
];

export default HowItWorks;