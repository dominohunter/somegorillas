import React from "react";
import AchievementCoin from "../icons/achievement-coin";
import GlareButton from "../ui/glare-button";

interface AchievementModalCardProps {
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
}

const AchievementModalCard: React.FC<AchievementModalCardProps> = ({
  achievement,
  onClaim,
  isClaimPending,
}) => {
  const { claimed, progress, goal } = achievement;
  const progressPercentage = Math.min((progress / goal) * 100, 100);
  const isCompleted = progress >= goal;

  return (
    <div
      className={`flex items-center gap-5 p-4 border-2 bg-translucent-light-8 rounded-2xl transition-all duration-300 ${
        claimed
          ? "border-system-success-tertiary bg-system-success-quaternary"
          : isCompleted
            ? "border-accent-primary bg-accent-primary/10"
            : "border-translucent-light-4"
      }`}
    >
      {/* Achievement Coin */}
      <div
        className={`flex-shrink-0 p-6 border-2 rounded-[12px] transition-all duration-300 ${
          claimed
            ? "bg-system-success-quaternary border-system-success-tertiary"
            : isCompleted
              ? "bg-accent-primary/10 border-accent-primary"
              : "bg-translucent-light-8 border-translucent-light-4"
        }`}
      >
        <AchievementCoin size={92} claimed={claimed} />
      </div>

      {/* Achievement Info */}
      <div className="flex-1 space-y-3">
        <div className="space-y-2">
          <h3 className="text-light-primary text-h5 font-semibold">
            {achievement.title}
          </h3>
          <p className="text-translucent-light-64 text-body-2-medium font-pally">
            {achievement.description}
          </p>
        </div>

        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-translucent-light-64 text-caption-1-medium font-pally">
              Progress
            </span>
            <span className="text-light-primary text-caption-1-semibold font-pally">
              {progress}/{goal} ({Math.round(progressPercentage)}%)
            </span>
          </div>
          <div className="w-full bg-translucent-light-4 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                claimed
                  ? "bg-system-success-primary"
                  : isCompleted
                    ? "bg-accent-primary"
                    : "bg-translucent-light-32"
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bananas Reward */}
      <div className="text-center px-4">
        <p className="text-translucent-light-64 text-caption-2-medium font-pally mb-1">
          Reward
        </p>
        <p className="text-accent-primary text-h5 font-pally font-semibold">
          🍌 {achievement.xpReward}
        </p>
      </div>

      {/* Action Button */}
      <div className="min-w-[120px]">
        {claimed ? (
          <div className="flex items-center justify-center py-3 px-4 bg-system-success-quaternary border border-system-success-tertiary rounded-xl">
            <span className="text-system-success-primary text-body-2-semibold font-pally font-semibold">
              ✅ Claimed
            </span>
          </div>
        ) : isCompleted ? (
          <GlareButton
            onClick={() => onClaim(achievement.id)}
            background="#EAB308"
            borderRadius="12px"
            borderColor="transparent"
            glareColor="#ffffff"
            glareOpacity={0.3}
            width="100%"
            className="text-white py-3 px-4 text-body-2-semibold font-pally font-semibold animate-pulse"
            disabled={isClaimPending}
          >
            {isClaimPending ? "Claiming..." : "🎁 Claim"}
          </GlareButton>
        ) : (
          <div className="flex items-center justify-center py-3 px-4 bg-translucent-light-4 border border-translucent-light-8 rounded-xl">
            <span className="text-translucent-light-64 text-body-2-medium font-pally">
              ⏳ In Progress
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementModalCard;
