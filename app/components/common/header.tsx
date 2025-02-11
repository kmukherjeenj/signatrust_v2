// File: app/components/Header.tsx

import React, { useState } from "react";
import Link from "next/link";
import Logo from "../../components/Logo"; // Make sure this import is correct

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-gray-800 text-white shadow-md">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Logo className="w-8 h-8 text-purple-500" />
            <span className="text-xl font-bold">SignaTrust</span>
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/login">Login</NavLink>
            <NavLink
              href="/register"
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-full"
            >
              Register
            </NavLink>
          </div>
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>
        </div>
        {isMenuOpen && (
          <div className="md:hidden mt-4">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/login">Login</NavLink>
            <NavLink href="/documentation">Documentation</NavLink>
            <NavLink
              href="/register"
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-full inline-block mt-2"
            >
              Register
            </NavLink>
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
