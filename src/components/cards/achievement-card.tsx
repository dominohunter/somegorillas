import React from "react";
import Banana from "../icons/banana";
import { GlareButton } from "../ui/glare-button";

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
  onClaim,
  isClaimPending,
}) => {
  const { claimed, progress, goal } = achievement;
  const isCompleted = progress >= goal;

  return (
    <div className="flex flex-col gap-4 p-4 border-2 border-translucent-light-4 bg-translucent-light-4 rounded-[12px] ">
      <div className="flex items-center gap-5 self-stretch">
        <div className="p-3 flex justify-center rounded-[8px] bg-translucent-light-8 border-2 border-translucent-light-8">
          <Banana size={28} />
        </div>
        <div className="flex flex-col gap-1 flex-1 items-start">
          <p className="font-pally text-body-1 font-semibold text-light-primary">
            {achievement.title}
          </p>
          <p className="font-pally text-translucent-light-80 text-body-2">
            {achievement.description}
          </p>
        </div>
      </div>

      {!isCompleted && (
        <div className="py-3 px-5 rounded-[8px] h-12 bg-translucent-light-8 border-2 border-translucent-light-8">
          <div className="flex justify-between  items-center">
            <div className="flex gap-2">
              <span className="text-translucent-light-64 text-body-2 font-pally">
                Progress:
              </span>
              <span className="text-light-primary text-body-2 font-pally font-medium">
                {progress}/{goal}
              </span>
            </div>

            <div className="flex gap-2">
              <span
                className="text-button-48 font-semibold"
                style={{
                  background:
                    "linear-gradient(180deg, #FFEE61 0%, #FFCE3C 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                +{achievement.xpReward} Bananas
              </span>
            </div>
          </div>
        </div>
      )}

      {claimed && (
        <div className="flex justify-center h-12 py-3 px-5 rounded-[8px] bg-translucent-light-4 border-2 border-translucent-light-4">
          <span className="text-translucent-light-64 text-button-48 font-semibold">
            Completed
          </span>
        </div>
      )}

      {isCompleted && !claimed && (
        <GlareButton
          onClick={() => onClaim(achievement.id)}
          disabled={isClaimPending}
          borderRadius="8px"
          borderColor="rgba(255, 255, 255, 0.04)"
          className="w-full flex justify-center text-button-48 bg-light-primary disabled:opacity-50 disabled:cursor-not-allowed text-dark-primary font-semibold py-3 px-5 rounded-[8px] transition-colors"
        >
          {isClaimPending
            ? "Claiming..."
            : `Claim ${achievement.xpReward} Bananas`}
        </GlareButton>
      )}
    </div>

    // <div
    //   className="border-2 border-translucent-light-4 bg-translucent-light-8 rounded-[24px] p-4 flex items-center justify-center cursor-pointer hover:bg-translucent-light-12 transition-colors aspect-square w-[180px] h-[180px] md:w-auto md:h-auto"
    //   onClick={onClick}
    // >
    //   <AchievementCoin size={158} claimed={claimed} />
    // </div>
  );
};

export default AchievementCard;
