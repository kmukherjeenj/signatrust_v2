"use client";

import React, { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

// This component is a wrapper for all context providers in your application
export default function Providers({ children }: ProvidersProps) {
  return <>{children}</>;
}
