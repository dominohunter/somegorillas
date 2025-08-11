import React from "react";

interface WalletProps {
  size: number;
}

const Wallet: React.FC<WalletProps> = ({ size }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 8C8.89543 8 8 8.89543 8 10C8 11.1046 8.89543 12 10 12L38 12C41.3137 12 44 14.6863 44 18V38C44 41.3137 41.3137 44 38 44H10C6.68629 44 4 41.3137 4 38V10C4 6.68629 6.68629 4 10 4H34C35.1046 4 36 4.89543 36 6C36 7.10457 35.1046 8 34 8H10ZM8 15.6586V38C8 39.1046 8.89543 40 10 40H38C39.1046 40 40 39.1046 40 38V18C40 16.8954 39.1046 16 38 16L10 16C9.29873 16 8.62556 15.8797 8 15.6586ZM30 28C30 26.3431 31.3431 25 33 25C34.6569 25 36 26.3431 36 28C36 29.6569 34.6569 31 33 31C31.3431 31 30 29.6569 30 28Z"
        fill="white"
        fillOpacity="0.48"
      />
    </svg>
  );
};

export default Wallet;
