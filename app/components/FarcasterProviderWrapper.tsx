'use client'

import React from 'react'
import { FarcasterProvider } from '../context/FarcasterContext'

interface FarcasterProviderWrapperProps {
  children: React.ReactNode
}

const FarcasterProviderWrapper: React.FC<FarcasterProviderWrapperProps> = ({ children }) => {
  return <FarcasterProvider>{children}</FarcasterProvider>
}

export default FarcasterProviderWrapper