import React from 'react';
import Register from '../components/Register';
import ErrorBoundary from '../components/ErrorBoundary';

const RegisterPage: React.FC = () => (
  <ErrorBoundary fallback={<div>Something went wrong with the registration page. Please try refreshing.</div>}>
    <Register />
  </ErrorBoundary>
);

export default RegisterPage;