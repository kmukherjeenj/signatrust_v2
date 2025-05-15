"use client";

import React, { useState } from "react";
import Link from "next/link";
import Logo from "../../components/Logo"; // Make sure this import is correct

interface HeaderProps {
  handleGetStarted?: () => void;
}

const Header: React.FC<HeaderProps> = ({ handleGetStarted }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-gray-800 text-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Logo className="w-8 h-8 text-purple-500" />
            <span className="text-xl font-bold">SignaTrust</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#how-it-works">How It Works</NavLink>
            <NavLink href="#security">Security</NavLink>
            <NavLink href="#use-cases">Use Cases</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
            <NavLink href="/login">Login</NavLink>
            <button
              onClick={handleGetStarted}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-full text-white font-medium transition duration-300"
            >
              Try for Free
            </button>
          </div>

          <button
            className="md:hidden text-white focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-2 py-3 border-t border-gray-700">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#how-it-works">How It Works</NavLink>
            <NavLink href="#security">Security</NavLink>
            <NavLink href="#use-cases">Use Cases</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
            <NavLink href="/login">Login</NavLink>
            <button
              onClick={handleGetStarted}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-full text-white font-medium transition duration-300 w-full mt-3"
            >
              Try for Free
            </button>
          </div>
        )}
      </nav>
    </header>
  );
};

const NavLink: React.FC<{
  href: string;
  className?: string;
  children: React.ReactNode;
}> = ({ href, className = "", children }) => (
  <Link
    href={href}
    className={`text-gray-300 hover:text-white transition duration-300 block md:inline-block mb-2 md:mb-0 ${className}`}
  >
    {children}
  </Link>
);

export default Header;
