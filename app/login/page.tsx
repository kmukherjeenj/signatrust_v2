// C:\Source\signatrust\app\login\page.tsx

import React from 'react';
import Login from '../client/components/Login';
import ErrorBoundary from '../client/components/ErrorBoundary';

const LoginPage: React.FC = () => (
  <ErrorBoundary fallback={<div>Something went wrong with the login page. Please try refreshing.</div>}>
    <Login />
  </ErrorBoundary>
);

export default LoginPage;
