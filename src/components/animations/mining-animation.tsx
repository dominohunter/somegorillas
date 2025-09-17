"use client";

import React from "react";
import Image from "next/image";

interface MiningAnimationProps {
  size?: number;
  message?: string;
}

export default function MiningAnimation({ 
  size = 120, 
  message = "Processing..." 
}: MiningAnimationProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      {/* Mining Animation Container */}
      <div className="relative" style={{ width: size + 40, height: size + 40 }}>
        {/* Main mining icon with enhanced bounce animation */}
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{
            animation: "mining-bounce 1.5s ease-in-out infinite",
          }}
        >
          <Image
            src="/mine.svg"
            alt="Mining"
            width={size}
            height={size}
            className="drop-shadow-2xl filter"
            style={{
              filter: "drop-shadow(0 0 20px rgba(245, 186, 49, 0.3))",
            }}
          />
        </div>
        
        {/* Rotating glow effect behind the icon */}
        <div 
          className="absolute inset-0"
          style={{
            background: "conic-gradient(from 0deg, transparent, #F5BA31, transparent)",
            borderRadius: "50%",
            filter: "blur(12px)",
            opacity: 0.7,
            zIndex: -1,
            animation: "spin 3s linear infinite",
          }}
        />
        
        {/* Multiple pulsing ring effects */}
        <div 
          className="absolute inset-2"
          style={{
            border: "3px solid #F5BA31",
            borderRadius: "50%",
            opacity: 0.6,
            animation: "pulse 2s infinite",
          }}
        />
        <div 
          className="absolute inset-4"
          style={{
            border: "2px solid #E0A429",
            borderRadius: "50%",
            opacity: 0.4,
            animation: "pulse 2s infinite 0.5s",
          }}
        />
      </div>
      
      {/* Message */}
      <p className="text-white font-semibold text-h5 animate-pulse">
        {message}
      </p>
      
      {/* Mining progress dots */}
      <div className="flex space-x-2">
        <div 
          className="w-3 h-3 bg-[#F5BA31] rounded-full shadow-lg" 
          style={{ 
            animation: "mining-dig 1.2s ease-in-out infinite",
            animationDelay: "0ms" 
          }} 
        />
        <div 
          className="w-3 h-3 bg-[#F5BA31] rounded-full shadow-lg" 
          style={{ 
            animation: "mining-dig 1.2s ease-in-out infinite",
            animationDelay: "200ms" 
          }} 
        />
        <div 
          className="w-3 h-3 bg-[#F5BA31] rounded-full shadow-lg" 
          style={{ 
            animation: "mining-dig 1.2s ease-in-out infinite",
            animationDelay: "400ms" 
          }} 
        />
      </div>
      
      <style jsx>{`
        @keyframes mining-bounce {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-8px) rotate(-2deg); }
          50% { transform: translateY(-12px) rotate(0deg); }
          75% { transform: translateY(-8px) rotate(2deg); }
        }
        
        @keyframes mining-dig {
          0%, 100% { 
            transform: scale(1) translateY(0);
            opacity: 1;
          }
          50% { 
            transform: scale(1.3) translateY(-4px);
            opacity: 0.8;
            box-shadow: 0 0 15px #F5BA31;
          }
        }
      `}</style>
    </div>
  );
}