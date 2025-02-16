import React from "react";
import {
  Shield,
  Layers,
  FileText,
  Settings,
  UserCheck,
  Link2,
  Cpu,
  Mic,
  Sliders,
  Eye,
  BookOpen,
} from "lucide-react";

const Features: React.FC = () => {
  return (
    <section id="features" className="container mx-auto px-4 py-16">
      <h2 className="text-4xl font-bold mb-12 text-center">
        Why Choose SignaTrust?
      </h2>
      <div className="grid md:grid-cols-3 gap-8">
        {featureData.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>
    </section>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
}) => {
  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      <div className="w-12 h-12 mb-4 text-purple-500">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
};

const featureData: FeatureCardProps[] = [
  {
    icon: <Settings size={32} />,
    title: "Simplified Document Creation",
    description:
      "Easily create templates with dynamic fields, eliminating duplication and reducing errors.",
  },
  {
    icon: <UserCheck size={32} />,
    title: "Seamless User Experience",
    description:
      "Step-by-step guidance, inline assistance, and clear explanations make signing effortless.",
  },
  {
    icon: <Link2 size={32} />,
    title: "Effortless Integration",
    description:
      "Connect with various software platforms for seamless data transfer and workflow automation.",
  },
  {
    icon: <Cpu size={32} />,
    title: "AI-Powered Smart Documents",
    description:
      "Auto-fill fields, correct errors instantly, and generate summaries for faster processing.",
  },
  {
    icon: <Mic size={32} />,
    title: "Voice-Assisted Signing",
    description:
      "AI voice agents explain terms and conditions, ensuring clarity and informed decisions.",
  },
  {
    icon: <Sliders size={32} />,
    title: "Customizable Templates",
    description:
      "Adapt forms based on signer roles and dynamically hide irrelevant fields for a smoother experience.",
  },
  {
    icon: <Eye size={32} />,
    title: "Privacy-First Approach",
    description:
      "Automatically redact sensitive data and restrict unnecessary access for security and compliance.",
  },
  {
    icon: <BookOpen size={32} />,
    title: "Automated Summaries",
    description:
      "Get concise overviews of lengthy contracts, helping users quickly understand key terms.",
  },
];

export default Features;
