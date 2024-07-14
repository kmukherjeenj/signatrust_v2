import React from 'react';
import { Shield, Layers, FileText } from 'lucide-react';

const Features: React.FC = () => {
  return (
    <section id="features" className="container mx-auto px-4 py-16">
      <h2 className="text-4xl font-bold mb-12 text-center">Why Choose SignaTrust?</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {featureData.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>
    </section>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      <div className="w-12 h-12 mb-4 text-purple-500">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  )
}

const featureData: FeatureCardProps[] = [
  {
    icon: <Shield size={32} />,
    title: "Security You Can Trust",
    description: "Blockchain technology for tamper-proof audit trails and zero-knowledge proofs for enhanced privacy."
  },
  {
    icon: <Layers size={32} />,
    title: "Flexible and User-Friendly",
    description: "Portable identities and cloud-based accessibility across all devices."
  },
  {
    icon: <FileText size={32} />,
    title: "Transparent and Cost-Effective",
    description: "Usage-based pricing and end-to-end encryption for maximum security and affordability."
  }
];

export default Features;