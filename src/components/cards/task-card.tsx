import React from "react";
import CoinHead from "../icons/coin-head";
import CoinButt from "../icons/coin-butt";
import Coin from "../icons/coin";
import { GlareButton } from "../ui/glare-button";
import { formatFlipSide } from "@/lib/utils";
import { Quest } from "@/lib/types";
import Mine from "../icons/mine";
interface TaskCardProps {
  task: {
    id: string;
    questId: string;
    quest: Quest;
    completed: boolean;
    progressCount: number;
    claimed?: boolean;
  };
  onClaim?: (taskId: string) => void;
  isClaimPending?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onClaim,
  isClaimPending,
}) => {
  // Parse quest condition to get type and target
  const parseCondition = () => {
    const [type, target] = task.quest.condition.split(":");
    return { type, target: parseInt(target) };
  };

  const { type, target } = parseCondition();

  // Determine which icon to show based on quest condition
  const getTaskIcon = () => {
    if (type === "heads") {
      return <CoinHead size={180} />;
    } else if (type === "tails") {
      return <CoinButt size={180} />;
    } else if (type.startsWith("mine_")) {
      return <Mine size={180} />;
    } else {
      return <Coin size={180} />;
    }
  };
  // Format quest description
  const getQuestDescription = () => {
    if (type === "flip") {
      return `Make ${target} coin flips`;
    } else if (type === "mine_play") {
      return `Play ${target} mines games`;
    } else if (type === "mine_win") {
      return `Win ${target} mines games`;
    } else if (type === "mine_reveal") {
      return `Reveal ${target} tiles`;
    } else if (type === "mine_survive") {
      return `Survive ${target}+ tiles`;
    } else if (type === "mine_perfect") {
      return `Get ${target} perfect games`;
    } else if (type === "mine_difficulty") {
      return `Win with ${target}+ mines`;
    } else if (type === "mine_cashout_late") {
      return `Late cashout ${target} times`;
    } else if (type === "mine_cashout_early") {
      return `Early cashout ${target} times`;
    } else {
      return `Get ${target} ${type} results`;
    }
  };

  // Get natural subtitle description
  const getSubtitleDescription = () => {
    if (type === "flip") {
      return `Flip ${target} ${formatFlipSide(type)} on flipper`;
    } else if (type === "heads" || type === "tails") {
      return `Flip ${target} ${formatFlipSide(type)} on flipper`;
    } else if (type === "mine_play") {
      return `Complete games in mines`;
    } else if (type === "mine_win") {
      return `Cash out or get perfect in mines`;
    } else if (type === "mine_reveal") {
      return `Uncover safe tiles in completed games`;
    } else if (type === "mine_survive") {
      return `Don't hit mines for ${target}+ tiles`;
    } else if (type === "mine_perfect") {
      return `Clear all tiles without cashing out`;
    } else if (type === "mine_difficulty") {
      return `Win on high difficulty (${target}+ mines)`;
    } else if (type === "mine_cashout_late") {
      return `Cash out after revealing 15+ tiles`;
    } else if (type === "mine_cashout_early") {
      return `Cash out after revealing ≤5 tiles`;
    } else {
      return `Complete ${type} tasks`;
    }
  };

  return (
    <div className="border-2 border-translucent-light-4 bg-translucent-light-8 rounded-2xl p-4 flex flex-col items-center gap-4 cursor-grab active:cursor-grabbing select-none">
      {/* Task Icon */}
      <div className="flex-shrink-0 bg-translucent-light-12 border-translucent-light-4 border-2 p-10 rounded-[12px]">
        {getTaskIcon()}
      </div>

      {/* Task Info */}
      <div className="flex-1">
        <p className="text-light-primary text-center text-stylized-body1 font-semibold ">
          {getQuestDescription()}
        </p>
        <p className="text-translucent-light-64 text-center text-body2-medium font-pally">
          {getSubtitleDescription()}
        </p>
      </div>

      {/* Claim Button */}
      <div className="flex items-center w-full">
        {task.claimed ? (
          <div className="flex items-center gap-2 py-3 px-5 bg-translucent-light-12 border border-translucent-light-4 rounded-[8px] w-full justify-center">
            <span className="text-button48 font-semibold text-translucent-light-64">
              Claimed {task.quest.rewardXp} bananas
            </span>
          </div>
        ) : task.completed ? (
          <GlareButton
            onClick={() => onClaim?.(task.questId)}
            background="#FFD700"
            borderRadius="8px"
            borderColor="transparent"
            glareColor="#ffffff"
            glareOpacity={0.3}
            width="100%"
            className="text-dark-primary py-3 px-5 text-button48  font-semibold flex items-center justify-center gap-2"
            disabled={isClaimPending}
          >
            {isClaimPending ? (
              "Claiming..."
            ) : (
              <>Claim {task.quest.rewardXp} bananas</>
            )}
          </GlareButton>
        ) : (
          <div className="flex items-center gap-2 py-3 px-5 bg-translucent-light-12 border border-translucent-light-4 rounded-[8px] w-full justify-center">
            <span className="text-accent-primary text-button48 font-semibold">
              +{task.quest.rewardXp} bananas
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
