'use client';

import { Spinner } from './Spinner';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles = {
  primary: 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-semibold hover:opacity-90',
  secondary: 'border border-white/10 text-white hover:bg-white/5',
  danger: 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30',
  ghost: 'text-zinc-400 hover:text-white hover:bg-white/5',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-sm',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, loading, disabled, variant = 'primary', size = 'md', className = '', ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={loading || disabled}
        aria-busy={loading}
        className={`
          inline-flex items-center justify-center gap-2 rounded-lg font-medium
          transition-colors disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]} ${sizeStyles[size]} ${className}
        `}
        {...props}
      >
        {loading && <Spinner size="sm" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
