import React from "react";

interface StatusMessageProps {
  message: string;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`backdrop-blur-[60px] p-3 rounded-xl border-2 max-w-sm ${
          message.includes("Error") || message.includes("failed")
            ? "bg-red-500/20 text-red-300 border-red-500/40"
            : message.includes("successfully") || message.includes("started")
              ? "bg-green-500/20 text-green-300 border-green-500/40"
              : "bg-blue-500/20 text-blue-300 border-blue-500/40"
        }`}
      >
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
};