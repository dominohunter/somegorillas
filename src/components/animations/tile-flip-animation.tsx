"use client";

import React, { useState, useEffect } from "react";

interface TileFlipAnimationProps {
  message?: string;
}

interface Tile {
  id: number;
  isFlipped: boolean;
  isRevealed: boolean;
  isSafe: boolean;
}

export default function TileFlipAnimation({ 
  message = "Processing..." 
}: TileFlipAnimationProps) {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [currentFlipping, setCurrentFlipping] = useState<number>(-1);

  // Initialize tiles
  useEffect(() => {
    const initialTiles: Tile[] = Array.from({ length: 9 }, (_, i) => ({
      id: i,
      isFlipped: false,
      isRevealed: false,
      isSafe: Math.random() > 0.3, // 70% chance of safe tile
    }));
    setTiles(initialTiles);
  }, []);

  // Animate tiles flipping one by one
  useEffect(() => {
    if (tiles.length === 0) return;

    const flipTiles = async () => {
      for (let i = 0; i < tiles.length; i++) {
        await new Promise((resolve) => {
          setTimeout(() => {
            setCurrentFlipping(i);
            
            // Start flip animation
            setTimeout(() => {
              setTiles(prev => prev.map(tile => 
                tile.id === i 
                  ? { ...tile, isFlipped: true }
                  : tile
              ));
            }, 300);

            // Reveal tile content
            setTimeout(() => {
              setTiles(prev => prev.map(tile => 
                tile.id === i 
                  ? { ...tile, isRevealed: true }
                  : tile
              ));
              setCurrentFlipping(-1);
              resolve(void 0);
            }, 600);
          }, i * 200);
        });
      }

      // Reset animation after all tiles are flipped
      setTimeout(() => {
        setTiles(prev => prev.map(tile => ({
          ...tile,
          isFlipped: false,
          isRevealed: false,
          isSafe: Math.random() > 0.3,
        })));
      }, 1000);
    };

    const interval = setInterval(flipTiles, (tiles.length * 200) + 2000);
    flipTiles(); // Start immediately

    return () => clearInterval(interval);
  }, [tiles.length]);

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      {/* Tile Grid */}
      <div className="grid grid-cols-3 gap-3">
        {tiles.map((tile) => (
          <div
            key={tile.id}
            className="relative w-16 h-16"
            style={{
              perspective: "1000px",
            }}
          >
            <div
              className={`
                w-full h-full relative preserve-3d
                ${currentFlipping === tile.id ? "tile-flipping" : ""}
                ${tile.isFlipped && currentFlipping !== tile.id ? "rotate-y-180" : ""}
              `}
              style={{
                transformStyle: "preserve-3d",
                transform: tile.isFlipped && currentFlipping !== tile.id ? "rotateY(180deg)" : "rotateY(0deg)",
                transition: currentFlipping !== tile.id ? "transform 600ms cubic-bezier(0.4, 0, 0.2, 1)" : "none",
              }}
            >
              {/* Front side (unrevealed) */}
              <div
                className="absolute inset-0 w-full h-full bg-translucent-dark-24 border-2 border-translucent-light-4 rounded-xl flex items-center justify-center backface-hidden shadow-lg"
                style={{
                  backfaceVisibility: "hidden",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                }}
              >
                <span className="text-white font-bold text-sm drop-shadow-sm">{tile.id + 1}</span>
              </div>

              {/* Back side (revealed) */}
              <div
                className={`
                  absolute inset-0 w-full h-full rounded-xl flex items-center justify-center backface-hidden shadow-lg
                  ${tile.isSafe 
                    ? "bg-[#F5BA31] border-2 border-[#E0A429]" 
                    : "bg-red-500 border-2 border-red-400"
                  }
                `}
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  boxShadow: tile.isSafe 
                    ? "0 4px 12px rgba(245, 186, 49, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
                    : "0 4px 12px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                }}
              >
                <span className="text-2xl drop-shadow-lg filter">
                  {tile.isSafe ? "✓" : "💣"}
                </span>
              </div>
            </div>

            {/* Glow effect for currently flipping tile */}
            {currentFlipping === tile.id && (
              <div
                className="absolute inset-0 rounded-xl glow-animation"
                style={{
                  pointerEvents: "none",
                  zIndex: -1,
                }}
              />
            )}
          </div>
        ))}
      </div>
      
      {/* Message */}
      <p className="text-white font-semibold text-h5 animate-pulse">
        {message}
      </p>
      
      {/* Progress indicator */}
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-[#F5BA31] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="w-3 h-3 bg-[#F5BA31] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="w-3 h-3 bg-[#F5BA31] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>

      <style jsx>{`
        .preserve-3d {
          transform-style: preserve-3d;
        }
        
        .backface-hidden {
          backface-visibility: hidden;
        }
        
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        
        .duration-600 {
          transition-duration: 600ms;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes tile-flip {
          0% {
            transform: rotateY(0deg) scale(1);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          }
          25% {
            transform: rotateY(45deg) scale(1.05);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
          }
          50% {
            transform: rotateY(90deg) scale(1.1);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4);
          }
          75% {
            transform: rotateY(135deg) scale(1.05);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
          }
          100% {
            transform: rotateY(180deg) scale(1);
            box-shadow: 0 4px 12px rgba(245, 186, 49, 0.3);
          }
        }
        
        .tile-flipping {
          animation: tile-flip 600ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        @keyframes glow-pulse {
          0%, 100% {
            box-shadow: 0 0 10px rgba(245, 186, 49, 0.5);
          }
          50% {
            box-shadow: 0 0 30px rgba(245, 186, 49, 0.8), 0 0 40px rgba(245, 186, 49, 0.6);
          }
        }
        
        .glow-animation {
          animation: glow-pulse 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}