// app/components/Logo.tsx
import React from 'react'

interface LogoProps {
  className?: string
}

const Logo: React.FC<LogoProps> = ({ className = "w-10 h-10" }) => {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="20" fill="currentColor" />
      <path d="M30 70C40 40 60 40 70 70" stroke="white" strokeWidth="8" strokeLinecap="round" />
      <path d="M50 30V70" stroke="white" strokeWidth="8" strokeLinecap="round" />
      <path d="M35 35H65" stroke="white" strokeWidth="8" strokeLinecap="round" />
    </svg>
  )
}

export default Logo