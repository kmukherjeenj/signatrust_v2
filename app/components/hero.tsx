'use client'

import React from 'react';
import { motion } from 'framer-motion';

interface HeroProps {
  handleGetStarted: () => void;
}

const Hero: React.FC<HeroProps> = ({ handleGetStarted }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-20 text-center"
    >
      <h1 className="text-5xl font-bold mb-6">Secure Digital Signatures with Blockchain Technology</h1>
      <p className="text-xl mb-8">SignaTrust: The future of document signing and verification</p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleGetStarted}
        className="bg-purple-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-purple-700 transition duration-300"
      >
        Get Started
      </motion.button>
    </motion.section>
  );
};

export default Hero;