import React from "react";
import { Game } from "@/types/mine";

interface CashOutSectionProps {
  backendGame: Game;
  loading: boolean;
  onCashOut: () => void;
}

export const CashOutSection: React.FC<CashOutSectionProps> = ({
  backendGame,
  loading,
  onCashOut,
}) => {
  if (!backendGame || backendGame.gameState !== "PLAYING") {
    return null;
  }

  return (
    <div className="mt-6 bg-translucent-dark-24 border border-translucent-light-4 rounded-2xl p-6">
      <h4 className="text-lg font-semibold text-white mb-4">Cash Out</h4>
      <p className="text-translucent-light-64 text-sm mb-4">
        Reveal at least one tile to cash out.
      </p>
      <button
        disabled={loading || backendGame.tilesRevealed === 0}
        onClick={onCashOut}
        className={`w-full px-6 py-3 rounded-xl font-semibold transition-colors ${
          loading || backendGame.tilesRevealed === 0
            ? "bg-translucent-light-8 text-gray-200 cursor-not-allowed"
            : "bg-[#F5BA31] text-dark-primary hover:bg-[#E0A429]"
        }`}
      >
        {loading ? "Cashing Out..." : "Cash Out"}
      </button>
    </div>
  );
};