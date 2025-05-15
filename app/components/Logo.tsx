import React from "react";

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "w-8 h-8" }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        width="128"
        height="128"
        rx="20"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path
        d="M64 25C42.46 25 25 42.46 25 64C25 85.54 42.46 103 64 103C85.54 103 103 85.54 103 64C103 42.46 85.54 25 64 25ZM64 36C69.52 36 74 40.48 74 46C74 51.52 69.52 56 64 56C58.48 56 54 51.52 54 46C54 40.48 58.48 36 64 36ZM39 85.83V82C39 74.8 49.6 70.5 64 70.5C78.4 70.5 89 74.8 89 82V85.83C82.13 91.42 73.41 95 64 95C54.59 95 45.87 91.42 39 85.83Z"
        fill="currentColor"
      />
      <path d="M24 56H38V70H24V56Z" fill="currentColor" />
      <path d="M90 56H104V70H90V56Z" fill="currentColor" />
      <path d="M57 86H71V100H57V86Z" fill="currentColor" />
      <path d="M57 28H71V42H57V28Z" fill="currentColor" />
    </svg>
  );
};

export default Logo;
