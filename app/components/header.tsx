import React from 'react';
import Link from 'next/link';
import Logo from './Logo';  // Updated import

const Header: React.FC = () => {
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
            <NavLink href="/register" className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-full">
              Register
            </NavLink>
          </div>
        </div>
      </nav>
    </header>
  );
};

const NavLink: React.FC<{ href: string; className?: string; children: React.ReactNode }> = ({ href, className = '', children }) => (
  <Link href={href} className={`text-gray-300 hover:text-white transition duration-300 ${className}`}>
    {children}
  </Link>
);

export default Header;