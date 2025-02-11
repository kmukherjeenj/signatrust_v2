
import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

const DashboardClient = dynamic(() => import('./DashboardClient'), { ssr: false });

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardClient />
    </Suspense>
  );
}