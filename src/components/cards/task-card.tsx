import React from "react";
import CoinHead from "../icons/coin-head";
import CoinButt from "../icons/coin-butt";
import Coin from "../icons/coin";
import { CartoonButton } from "../ui/cartoon-button";
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
      return <CoinHead size={28} />;
    } else if (type === "tails") {
      return <CoinButt size={28} />;
    } else if (type.startsWith("mine_")) {
      return <Mine size={28} />;
    } else {
      return <Coin size={28} />;
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
    } else if (type === "mine_games_played") {
      return `Play mines ${target} times`;
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
    } else if (type === "mine_games_played") {
      return `Completed after playing mines ${target} times`;
    } else {
      return `Complete ${type} tasks`;
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3 sm:gap-4 p-3 sm:p-4 border-2 items-center border-translucent-light-4 bg-translucent-light-4 rounded-[12px] cursor-grab active:cursor-grabbing select-none">
        <div className="flex gap-3 w-full items-center">
          {/* Task Icon */}
          <div className="flex justify-center flex-shrink-0">
            <div className="p-2 sm:p-3 flex justify-center rounded-[8px] bg-translucent-light-8 border-2 border-translucent-light-8">
              {getTaskIcon()}
            </div>
          </div>

          {/* Task Info */}
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <p className="font-pally text-sm sm:text-body-1 font-semibold text-light-primary truncate">
              {getQuestDescription()}
            </p>
            <p className="font-pally text-translucent-light-80 text-xs sm:text-body-2 truncate">
              {getSubtitleDescription()}
            </p>
          </div>
        </div>
        <div className="w-full">
          {/* Action Button/Status */}
          <div className="flex-shrink-0 w-full flex items-center">
            {task.claimed ? (
              <div className="flex justify-center w-full items-center py-2 px-3 sm:py-3 sm:px-4 rounded-[8px] bg-translucent-light-4 border-2 border-translucent-light-4">
                <span className="text-translucent-light-64 text-xs sm:text-sm font-semibold">
                  Completed
                </span>
              </div>
            ) : task.completed ? (
              <CartoonButton
                onClick={() => onClaim?.(task.questId)}
                disabled={isClaimPending}
                variant="secondary"
                size="sm"
                shadow="cartoon"
                className="text-xs sm:text-sm font-semibold w-full"
              >
                {isClaimPending
                  ? "Claiming..."
                  : `Claim ${task.quest.rewardXp} Bananas`}
              </CartoonButton>
            ) : (
              <div
                className="px-3 py-2 sm:px-4 text-white sm:py-3 w-full rounded-[8px] bg-translucent-light-8 flex items-center justify-center border-2 border-translucent-light-8"
              >
                <div className="flex gap-x-2">
                  <span className="text-translucent-light-64 text-body-2 font-pally">Progress</span>
                  <span className="text-light-primary text-body-2 font-pally font-medium">{task.progressCount}/{task.quest.condition.split(":")[1]}</span>
                </div>
                <span className="grow"></span>
                <span
                  className="text-xs sm:text-sm font-semibold"
                  style={{
                    background:
                      "linear-gradient(180deg, #FFEE61 0%, #FFCE3C 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  + {task.quest.rewardXp} Bananas
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TaskCard;
