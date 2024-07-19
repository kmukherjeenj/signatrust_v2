// app/dashboard/page.tsx

import React from 'react';
import Dashboard from '../client/components/Dashboard';
import ErrorBoundary from '../client/components/ErrorBoundary';

const DashboardPage: React.FC = () => (
  <ErrorBoundary fallback={<div>Something went wrong with the dashboard. Please try refreshing.</div>}>
    <Dashboard />
  </ErrorBoundary>
);

export default DashboardPage;