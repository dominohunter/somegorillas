import React from "react";
import Banana from "../icons/banana";

interface LeaderboardCardProps {
  user: {
    walletAddress: string;
    xp: number;
  };
  rank: number;
  isCurrentUser?: boolean;
}

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({ user, rank, isCurrentUser = false }) => {
  const isTopThree = rank <= 3;

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-[#FFD700] text-black"; // Gold
      case 2:
        return "bg-[#9AC9E4] text-black"; // Silver
      case 3:
        return "bg-[#ED8C25] text-black"; // Bronze
      default:
        return "bg-translucent-light-16 text-light-primary";
    }
  };
  return (
    <div
      className={`flex justify-between items-center p-3  rounded-xl transition-colors border-2 ${
        isCurrentUser
          ? "bg-gradient-to-r from-accent-primary/20 to-accent-primary/10 border-accent-primary"
          : isTopThree
          ? "bg-gradient-to-r from-translucent-light-8 to-translucent-light-4 border-translucent-light-8"
          : "bg-translucent-light-4 border-translucent-light-8"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`px-3 py-1 rounded-[8px] flex items-center justify-center text-body2-medium font-pally font-bold ${getRankColor(rank)}`}
        >
          {rank}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-light-primary text-body-2 font-pally truncate max-w-32">
            {user.walletAddress.slice(0, 6)}...
            {user.walletAddress.slice(-4)}
          </span>
          {isCurrentUser && (
            <span className="text-accent-primary text-caption-1-medium font-pally font-semibold bg-accent-primary/20 px-2 py-1 rounded-md">
              You
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center">
        <Banana size={24} />
        <span className="text-accent-primary font-pally text-body2-medium font-semibold">
          {user.xp.toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default LeaderboardCard;
