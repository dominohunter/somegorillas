import React from "react";

interface MedalProps {
  size: number;
}

const Medal: React.FC<MedalProps> = ({ size }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="8"
        r="6"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M8.21 13.89L7 23l5-3 5 3-1.21-9.11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle
        cx="12"
        cy="8"
        r="2"
        fill="currentColor"
      />
    </svg>
  );
};

export default Medal;