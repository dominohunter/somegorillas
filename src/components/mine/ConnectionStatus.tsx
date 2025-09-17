import React from "react";

interface ConnectionStatusProps {
  isConnected: boolean;
  isClient: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  isClient,
}) => {
  if (!isClient) return null;

  if (!isConnected) {
    return (
      <div className="backdrop-blur-[60px] bg-red-500/20 border-2 rounded-3xl border-red-500/40 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-red-300 font-semibold">⚠️ Wallet Required</h3>
            <p className="text-red-200 text-sm">
              Please connect your wallet to start playing mine games.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};