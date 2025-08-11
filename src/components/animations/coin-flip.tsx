"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

interface CoinFlipProps {
  isFlipping: boolean;
  result?: "head" | "tail" | null;
  onAnimationComplete?: () => void;
  size?: number;
}

const CoinFlip: React.FC<CoinFlipProps> = ({
  isFlipping,
  result,
  onAnimationComplete,
  size = 200,
}) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (!isFlipping) {
      setCurrentFrame(0);
      setShowResult(false);
      return;
    }

    setShowResult(false);
    let frameIndex = 0;

    const interval = setInterval(() => {
      frameIndex++;

      if (frameIndex <= 12) {
        setCurrentFrame(frameIndex);
      } else {
        // If result is available, stop and show it
        if (result) {
          clearInterval(interval);
          setShowResult(true);
          onAnimationComplete?.();
        } else {
          // Keep looping until result is ready
          frameIndex = 0;
        }
      }
    }, 50); // 50ms per frame = 0.6s per loop

    return () => clearInterval(interval);
  }, [isFlipping, result, onAnimationComplete]);

  const getCurrentImageSrc = () => {
    if (!isFlipping) {
      return "/coin/idle.svg";
    }

    if (showResult && result) {
      // Show final result - we can map this to head/tail specific frames if needed
      return result === "head" ? "/coin/1.svg" : "/coin/7.svg";
    }

    if (currentFrame > 0) {
      return `/coin/${currentFrame}.svg`;
    }

    return "/coin/idle.svg";
  };

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Glow effect */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-300 ${
          isFlipping
            ? "bg-gradient-to-r from-yellow-400/30 via-orange-400/30 to-yellow-400/30 blur-xl scale-110"
            : "bg-gradient-to-r from-yellow-400/10 via-orange-400/10 to-yellow-400/10 blur-lg scale-105"
        }`}
      />

      {/* Coin image */}
      <div className="relative z-10">
        <Image
          src={getCurrentImageSrc()}
          alt="Coin"
          width={size}
          height={size}
          className={`transition-all duration-200 ${
            isFlipping ? "drop-shadow-2xl" : "drop-shadow-lg"
          }`}
          priority
        />
      </div>

      {/* Additional glow for flipping state */}
      {isFlipping && (
        <div
          className="absolute inset-0 rounded-full bg-yellow-400/20 animate-pulse"
          style={{
            filter: "blur(20px)",
            transform: "scale(1.3)",
          }}
        />
      )}
    </div>
  );
};

export default CoinFlip;
