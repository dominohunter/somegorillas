import React from "react";
import AchievementCoin from "../icons/achievement-coin";

interface AchievementCardProps {
  achievement: {
    id: string;
    title: string;
    description: string;
    progress: number;
    goal: number;
    claimed: boolean;
    xpReward: number;
  };
  onClaim: (id: string) => void;
  isClaimPending: boolean;
  onClick?: () => void;
}

const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  // onClaim,
  // isClaimPending,
  onClick,
}) => {
  const { claimed } = achievement;

  return (
    <div
      className="border-2 border-translucent-light-4 bg-translucent-light-8 rounded-[24px] p-4 flex items-center justify-center cursor-pointer hover:bg-translucent-light-12 transition-colors aspect-square w-[180px] h-[180px] md:w-auto md:h-auto"
      onClick={onClick}
    >
      <AchievementCoin size={158} claimed={claimed} />
    </div>
  );
};

export default AchievementCard;
