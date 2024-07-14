'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import Header from './components/header';
import Hero from './components/hero';
import Features from './components/features';
import HowItWorks from './components/howItWorks';
import Pricing from './components/pricing';
import Footer from './components/footer';

const Home: React.FC = () => {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/register');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main>
        <Hero handleGetStarted={handleGetStarted} />
        <Features />
        <HowItWorks />
        <Pricing handleGetStarted={handleGetStarted} />
      </main>
      <Footer />
    </div>
  );
};

export default Home;