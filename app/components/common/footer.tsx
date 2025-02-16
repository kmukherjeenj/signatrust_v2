import React from "react";
import Logo from "../../components/Logo";
import Link from "next/link";
import { Linkedin, Facebook, X } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Logo className="w-8 h-8 text-purple-500 mr-2" />
            <span className="text-xl font-bold">SignaTrust</span>
          </div>
          <div className="flex space-x-4 mb-4 md:mb-0">
            <SocialLink
              href="#"
              label="LinkedIn"
              icon={<Linkedin size={20} />}
            />
            <SocialLink href="#" label="X" icon={<X size={20} />} />
            <SocialLink
              href="#"
              label="Facebook"
              icon={<Facebook size={20} />}
            />
          </div>
          <div className="text-gray-400 text-sm">
            <p>Contact us: info@signatrust.io | 1-800-SIGNATRUST</p>
          </div>
        </div>
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>
            &copy; {new Date().getFullYear()} SignaTrust. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

const SocialLink: React.FC<{
  href: string;
  label: string;
  icon: React.ReactNode;
}> = ({ href, label, icon }) => (
  <Link
    href={href}
    className="text-gray-400 hover:text-purple-500 transition duration-300 flex items-center space-x-2"
  >
    {icon}
    <span>{label}</span>
  </Link>
);

export default Footer;
