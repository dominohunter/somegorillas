import React from "react";
import { Game } from "@/types/mine";
import { BOARD_SIZE } from "@/constants/mine";

interface GameInfoProps {
  backendGame: Game;
}

export const GameInfo: React.FC<GameInfoProps> = ({ backendGame }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <div className="text-center">
        <span className="text-translucent-light-64 block text-sm">Mines</span>
        <span className="font-bold text-white text-lg">
          {backendGame.mineCount}
        </span>
      </div>
      <div className="text-center">
        <span className="text-translucent-light-64 block text-sm">Revealed</span>
        <span className="font-bold text-white text-lg">
          {backendGame.tilesRevealed}
        </span>
      </div>
      <div className="text-center">
        <span className="text-translucent-light-64 block text-sm">State</span>
        <span className="font-bold text-white text-lg">
          {backendGame.gameState}
        </span>
      </div>
      <div className="text-center">
        <span className="text-translucent-light-64 block text-sm">Safe Left</span>
        <span className="font-bold text-white text-lg">
          {BOARD_SIZE - backendGame.mineCount - backendGame.tilesRevealed}
        </span>
      </div>
    </div>
  );
};