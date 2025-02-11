import React from 'react';

export const Label = ({ htmlFor, children, className }: { htmlFor: string; children: React.ReactNode; className?: string }) => {
  return (
    <label htmlFor={htmlFor} className={`label ${className || ''}`}>
      {children}
    </label>
  );
};