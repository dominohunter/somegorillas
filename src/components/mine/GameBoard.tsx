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

  const renderTile = (index: number) => {
    const isRevealed = revealedTiles.has(index);
    const isFlipping = flippingTiles.has(index);
    const isGameActive = backendGame?.gameState === "PLAYING";
    // Check if tile is a mine from mineTiles set (set immediately when backend responds)
    const isMine = mineTiles.has(index);

    const handleClick = () => {
      if (isGameActive && !isRevealed && !isFlipping) {
        onRevealTile(index);
      }
    };

    return (
      <div
        key={index}
        className="aspect-square"
        style={{ perspective: "1000px" }}
      >
        <div
          className={`
            w-full h-full relative cursor-pointer transition-all duration-700 ease-out
            ${!isGameActive || isRevealed ? "cursor-default" : "hover:scale-105"}
            ${isFlipping ? "animate-pulse" : ""}
          `}
          onClick={handleClick}
          style={{
            transformStyle: "preserve-3d",
            transform: isRevealed && !isFlipping ? "rotateY(180deg)" : "rotateY(0deg)",
            transition: isRevealed && !isFlipping ? "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
          }}
        >
          {/* Front side (unrevealed) */}
          <div
            className="absolute inset-0 w-full h-full rounded-xl"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="w-full h-full bg-translucent-dark-48 border-2 border-translucent-dark-32 rounded-xl shadow-lg flex items-center justify-center relative overflow-hidden">
              <Image
                src="/coin/idle.svg"
                alt="Hidden"
                width={40}
                height={40}
                className="w-10 h-10 drop-shadow-lg"
              />
            </div>
          </div>

          {/* Back side (revealed) */}
          <div
            className="absolute inset-0 w-full h-full rounded-xl"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            {isMine ? (
              // Mine tile - simple red with bomb
              <div
                className="w-full h-full border-2 rounded-xl shadow-xl flex items-center justify-center relative"
                style={{
                  backgroundColor: "#ef4444",
                  borderColor: "#fbbf24",
                }}
              >
                <div
                  className="text-white font-bold"
                  style={{ fontSize: "32px" }}
                >
                  <Image src={"/mine.svg"} layout="fill" alt="Mine" />
                </div>
              </div>
            ) : (
              // Safe tile - simple yellow with banana
              <div
                className="w-full h-full border-2 rounded-xl shadow-xl flex items-center justify-center relative"
                style={{
                  backgroundColor: "#fbbf24",
                  borderColor: "#d97706",
                }}
              >
                <Image
                  src="/icons/Banana.svg"
                  alt="Safe"
                  width={40}
                  height={40}
                  className="w-10 h-10 drop-shadow-xl"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className={`grid grid-cols-${BOARD_COLS} gap-4 p-6`}>
        {Array.from({ length: boardSize }, (_, i) => renderTile(i))}
      </div>

      {/* Flip animation keyframes */}
      <style jsx>{`
        @keyframes flip {
          0% {
            transform: rotateY(0deg) scale(1);
          }
          30% {
            transform: rotateY(50deg) scale(1.08);
          }
          70% {
            transform: rotateY(130deg) scale(1.08);
          }
          100% {
            transform: rotateY(180deg) scale(1);
          }
        }
      `}</style>
    </div>
  );
};
