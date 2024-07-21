import React from 'react';
import { Check } from 'lucide-react';

interface PricingProps {
  handleGetStarted: () => void;
}

const Pricing: React.FC<PricingProps> = ({ handleGetStarted }) => {
  return (
    <section id="pricing" className="container mx-auto px-4 py-16">
      <h2 className="text-4xl font-bold mb-12 text-center">Transparent, Usage-Based Pricing</h2>
      <div className="max-w-sm mx-auto bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-8">
          <h3 className="text-2xl font-semibold text-center mb-4">Flexible Plan</h3>
          <div className="text-center mb-6">
            <span className="text-4xl font-bold text-purple-500">Pay as you go</span>
          </div>
          <ul className="mb-8">
            {features.map((feature, index) => (
              <PricingFeature key={index}>{feature}</PricingFeature>
            ))}
          </ul>
          <button
            onClick={handleGetStarted}
            className="w-full bg-purple-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-purple-700 transition duration-300"
          >
            Start Your Free Trial
          </button>
        </div>
      </div>
    </section>
  )
}

const PricingFeature: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <li className="flex items-center mb-3 text-gray-300">
      <Check className="w-5 h-5 text-purple-500 mr-2" />
      {children}
    </li>
  )
}

const features = [
  "Scale with your needs",
  "No long-term commitments",
  "Perfect for businesses of all sizes"
];

export default Pricing;