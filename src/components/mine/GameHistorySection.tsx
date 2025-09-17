import React from "react";
import { formatEther } from "viem";
import { GameHistory } from "@/types/mine";

interface GameHistorySectionProps {
  gameHistory: GameHistory | null;
}

export const GameHistorySection: React.FC<GameHistorySectionProps> = ({
  gameHistory,
}) => {
  return (
    <div className="backdrop-blur-[60px] bg-translucent-dark-12 border-2 rounded-3xl border-translucent-light-4 p-6">
      <h3 className="text-xl font-semibold text-white mb-6">Recent Games</h3>
      <div className="space-y-4">
        {gameHistory?.games.slice(0, 3).map((game) => (
          <div key={game.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-lg text-sm font-bold ${
                  game.gameState === "CASHED_OUT"
                    ? "text-green-300 bg-green-500/20"
                    : game.gameState === "PERFECT"
                      ? "text-purple-300 bg-purple-500/20"
                      : "text-red-300 bg-red-500/20"
                }`}
              >
                {game.gameState.replace("_", " ")}
              </span>
              <div className="text-left">
                <div className="text-translucent-light-64 text-sm">
                  {game.mineCount} mines
                </div>
                <div className="text-translucent-light-64 text-sm">
                  {game.tilesRevealed} tiles
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-bold">
                {parseFloat(formatEther(BigInt(game.betAmount))).toFixed(4)} STT
              </div>
            </div>
          </div>
        )) || (
          <div className="text-translucent-light-64 text-center">
            No games yet
          </div>
        )}
      </div>
    </div>
  );
};
