'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import Header from './client/components/header';
import Hero from './client/components/hero';
import Features from './client/components/features';
import HowItWorks from './client/components/howItWorks';
import Pricing from './client/components/pricing';
import Footer from './client/components/footer';

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