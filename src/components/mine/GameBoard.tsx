import React from "react";
import Image from "next/image";
import { Game } from "@/types/mine";
import { BOARD_SIZE, BOARD_COLS } from "@/constants/mine";

interface GameBoardProps {
  backendGame: Game | null;
  revealedTiles: Set<number>;
  mineTiles: Set<number>;
  flippingTiles: Set<number>;
  onRevealTile: (tileIndex: number) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  backendGame,
  revealedTiles,
  mineTiles,
  flippingTiles,
  onRevealTile,
}) => {
  const boardSize = backendGame ? backendGame.boardSize : BOARD_SIZE;

  const tiles = Array.from({ length: boardSize }, (_, i) => {
    const isRevealed = revealedTiles.has(i);
    const isMine = mineTiles.has(i);
    const isFlipping = flippingTiles.has(i);
    const isGameActive = backendGame && backendGame.gameState === "PLAYING";
    const isDisabled = !isGameActive || isRevealed || isFlipping;

    return (
      <div key={i} className="relative" style={{ perspective: "1000px" }}>
        <button
          disabled={isDisabled}
          onClick={() => (isGameActive ? onRevealTile(i) : null)}
          className={`
            w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 lg:w-22 lg:h-22 relative transition-all duration-200 preserve-3d
            ${!isGameActive ? "cursor-default opacity-60" : isFlipping ? "cursor-wait" : isRevealed ? "cursor-default" : "cursor-pointer hover:scale-105"}
            ${isFlipping ? "tile-flipping" : ""}
          `}
          style={{
            transformStyle: "preserve-3d",
            transform:
              isRevealed && !isFlipping ? "rotateY(180deg)" : "rotateY(0deg)",
            transition: !isFlipping
              ? "transform 600ms cubic-bezier(0.4, 0, 0.2, 1)"
              : "none",
          }}
        >
          {/* Front side (unrevealed) */}
          <div
            className="absolute bg-translucent-dark-48 inset-0 w-full h-full border-2 sm:border-3 border-translucent-light-4 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center backface-hidden text-white font-black text-xs sm:text-sm md:text-base lg:text-xl"
            style={{
              backfaceVisibility: "hidden",
              boxShadow:
                "0 2px 6px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
            }}
          >
            <Image
              src="/icons/Banana.svg"
              alt="Banana"
              width={32}
              height={32}
              className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 drop-shadow-lg"
            />
          </div>

          {/* Back side (revealed) */}
          <div
            className={`absolute inset-0 w-full h-full border-2 sm:border-3 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center backface-hidden font-black text-sm sm:text-base md:text-lg lg:text-2xl ${
              isMine
                ? "bg-red-500 border-red-400 text-white"
                : "bg-accent-secondary border-[#E0A429] text-dark-primary"
            }`}
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              boxShadow: isMine
                ? "0 2px 8px rgba(239, 68, 68, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.25)"
                : "0 2px 8px rgba(245, 186, 49, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.25)",
            }}
          >
            {isMine ? (
              <Image
                src="/mine.svg"
                alt="Mine"
                width={32}
                height={32}
                className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 drop-shadow-lg"
              />
            ) : (
              <Image
                src="/icons/Butt.svg"
                alt="Safe"
                width={32}
                height={32}
                className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 drop-shadow-lg"
              />
            )}
          </div>
        </button>

        {/* Glow effect for flipping tile */}
        {isFlipping && (
          <div
            className="absolute inset-0 rounded-xl glow-animation pointer-events-none"
            style={{ zIndex: -1 }}
          />
        )}
      </div>
    );
  });

  return (
    <div className="flex justify-center">
      <div className={`grid grid-cols-${BOARD_COLS} gap-4 w-full max-w-lg`}>
        {tiles}
      </div>

      {/* CSS for flip animations */}
      <style jsx>{`
        .preserve-3d {
          transform-style: preserve-3d;
        }

        .backface-hidden {
          backface-visibility: hidden;
        }

        @keyframes tile-flip {
          0% {
            transform: rotateY(0deg) scale(1);
          }
          25% {
            transform: rotateY(45deg) scale(1.05);
          }
          50% {
            transform: rotateY(90deg) scale(1.1);
          }
          75% {
            transform: rotateY(135deg) scale(1.05);
          }
          100% {
            transform: rotateY(180deg) scale(1);
          }
        }

        .tile-flipping {
          animation: tile-flip 600ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes glow-pulse {
          0%,
          100% {
            box-shadow: 0 0 10px rgba(245, 186, 49, 0.5);
          }
          50% {
            box-shadow:
              0 0 30px rgba(245, 186, 49, 0.8),
              0 0 40px rgba(245, 186, 49, 0.6);
          }
        }

        .glow-animation {
          animation: glow-pulse 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
