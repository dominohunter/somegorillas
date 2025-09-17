import React from "react";
import { Game } from "@/types/mine";
import { MINE_COUNTS } from "@/constants/mine";

interface GameControlsProps {
  mineCount: number;
  onMineCountChange: (count: number) => void;
  backendGame: Game | null;
  isGameDisabled: boolean;
  onStartGame: () => void;
  getStartButtonText: () => string;
}

export const GameControls: React.FC<GameControlsProps> = ({
  mineCount,
  onMineCountChange,
  backendGame,
  isGameDisabled,
  onStartGame,
  getStartButtonText,
}) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <label className="font-semibold text-white">Mine Count:</label>
          <select
            value={mineCount}
            onChange={(e) => onMineCountChange(Number(e.target.value))}
            className="px-4 py-2 bg-translucent-dark-24 border border-translucent-light-4 rounded-xl text-white focus:outline-none focus:border-[#F5BA31]"
            disabled={isGameDisabled || !!backendGame}
          >
            {MINE_COUNTS.map((n) => (
              <option
                key={n}
                value={n}
                className="bg-dark-primary text-white"
              >
                {n} mines
              </option>
            ))}
          </select>
        </div>
        {!backendGame && (
          <button
            disabled={isGameDisabled}
            onClick={onStartGame}
            className={`px-6 py-2 rounded-xl font-semibold transition-colors flex-1 sm:flex-none ${
              isGameDisabled
                ? "bg-translucent-light-8 text-gray-200 cursor-not-allowed"
                : "bg-[#F5BA31] text-dark-primary hover:bg-[#E0A429]"
            }`}
          >
            {getStartButtonText()}
          </button>
        )}
      </div>
    </div>
  );
};