"use client";

import React from "react";
import { GameStats } from "@/types/mine";
import Image from "next/image";

interface StatsSectionProps {
  userStats: GameStats | null;
  totalXP?: number;
}

export const StatsSection: React.FC<StatsSectionProps> = ({
  userStats,
  totalXP,
}) => {
  return (
    <div className="backdrop-blur-[60px] bg-translucent-dark-12 border-2 rounded-3xl border-translucent-light-4 p-6">
      <h3 className="text-xl font-semibold text-white mb-6">Statistics</h3>
      <div className="space-y-4">
        {/* Total XP */}
        {totalXP !== undefined && (
          <div className="flex justify-between border-b border-translucent-light-4 pb-4 mb-4">
            <span className="text-[#F5BA31] font-semibold flex">
              <Image
                width={24}
                height={24}
                src="/icons/Banana.svg"
                alt="Coin"
                className="w-6 h-6 mr-2"
              />
              Total Bananas
            </span>
            <span className="text-[#F5BA31] font-bold text-2xl">
              {totalXP.toLocaleString()}
            </span>
          </div>
        )}

        {/* Mine-specific stats */}
        {userStats ? (
          <>
            <div className="flex justify-between">
              <span className="text-translucent-light-64">Games</span>
              <span className="text-white font-bold text-xl">
                {userStats.gamesPlayed}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-translucent-light-64">Win Rate</span>
              <span className="text-white font-bold text-xl">
                {userStats.gamesPlayed > 0
                  ? (
                      (userStats.gamesWon / userStats.gamesPlayed) *
                      100
                    ).toFixed(1)
                  : "0"}
                %
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-translucent-light-64">Perfect</span>
              <span className="text-white font-bold text-xl">
                {userStats.gamesPerfect}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-translucent-light-64">Best Streak</span>
              <span className="text-white font-bold text-xl">
                {userStats.bestWinStreak}
              </span>
            </div>
          </>
        ) : (
          <div className="text-translucent-light-64 text-center">
            No mine stats available
          </div>
        )}
      </div>
    </div>
  );
};
