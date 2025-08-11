import React from "react";

interface FireProps {
  size: number;
}

const Fire: React.FC<FireProps> = ({ size }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.5 14.5a2.5 2.5 0 0 0 0 5 2.5 2.5 0 0 0 0-5z"
        fill="currentColor"
      />
      <path
        d="M16 10c0 7-3 11-8 11-6 0-8-5-8-9 0-4 3-6 3-6s1 2 3 2c1 0 2-1 2-2 0-2 1-3 1-3s2 1 2 3c1 0 2-1 2-1s3 2 3 5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};

export default Fire;