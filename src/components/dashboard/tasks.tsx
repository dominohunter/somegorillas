"use client";

import { useQuests } from "@/lib/query-helper";
import { useClaimTask } from "@/lib/mutation-helper";
import { useAccount } from "wagmi";
import TaskCard from "@/components/cards/task-card";
// import { GlareButton } from "@/components/ui/glare-button";
// import AddFriend from "@/components/icons/add-friend";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function Tasks() {
  const { address } = useAccount();
  const questsQuery = useQuests(address);
  // const referralQuery = useReferral();
  const claimTaskMutation = useClaimTask();
  // const [isCopied, setIsCopied] = useState(false);
  const [claimedTasks, setClaimedTasks] = useState<Set<string>>(new Set());
  const [claimingTaskId, setClaimingTaskId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "flip" | "mines">(
    "all",
  );

  const [timeUntilReset, setTimeUntilReset] = useState<string>("");

  // Calculate time until next midnight UTC
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const nextMidnightUTC = new Date(now);
      nextMidnightUTC.setUTCHours(24, 0, 0, 0);

      const timeDiff = nextMidnightUTC.getTime() - now.getTime();
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));

      setTimeUntilReset(`${hours}h `);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  // const handleCopyReferralLink = async () => {
  //   if (referralQuery.data?.referralCode) {
  //     const referralLink = `${window.location.origin}?ref=${referralQuery.data.referralCode}`;
  //     try {
  //       await navigator.clipboard.writeText(referralLink);
  //       setIsCopied(true);
  //       // Success feedback for copying referral link
  //       toast.success("Referral link copied!", {
  //         description: "Share this link with friends to earn rewards.",
  //       });

  //       setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
  //     } catch (err) {
  //       console.error("Failed to copy: ", err);
  //     }
  //   }
  // };

  // Filter tasks based on active filter
  const filteredQuests =
    questsQuery.data?.filter((quest) => {
      if (activeFilter === "all") return true;

      const [type] = quest.quest.condition.split(":");

      if (activeFilter === "flip") {
        return type === "flip" || type === "heads" || type === "tails";
      } else if (activeFilter === "mines") {
        return type.startsWith("mine_");
      }

      return true;
    }) || [];

  return (
    <div className="space-y-6">
      {/* Tasks Section */}
      <div className="p-5 bg-translucent-light-4 max-h-[736px] border-2 backdrop-blur-[60px] flex flex-col gap-5 rounded-3xl border-translucent-light-4 flex-1 min-h-0 overflow-y-auto">
        <div className="flex justify-between">
          <h2 className="text-h5 font-[600] text-light-primary">Quests</h2>
          <p className="font-pally text-translucent-light-64">
            New quest in {timeUntilReset}
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-2 rounded-xl text-button-40 transition-colors ${
              activeFilter === "all"
                ? "bg-light-primary px-4 py-3 text-dark-primary"
                : "bg-translucent-light-4 text-translucent-light-64 hover:text-light-primary border border-translucent-light-4"
            }`}
          >
            <p className="text-button-40 font-semibold">All</p>
          </button>
          <button
            onClick={() => setActiveFilter("flip")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeFilter === "flip"
                ? "bg-light-primary px-4 py-3 text-dark-primary"
                : "bg-translucent-light-4 text-translucent-light-64 hover:text-light-primary border border-translucent-light-4"
            }`}
          >
            <p className="text-button-40 font-semibold">Coin Flip</p>
          </button>
          <button
            onClick={() => setActiveFilter("mines")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeFilter === "mines"
                ? "bg-light-primary px-4 py-3 text-dark-primary"
                : "bg-translucent-light-4 text-translucent-light-64 hover:text-light-primary border border-translucent-light-4"
            }`}
          >
            <p className="text-button-40 font-semibold">Mines</p>
          </button>
        </div>
        {filteredQuests.length > 0 && (
          <div
            ref={scrollContainerRef}
            className="flex flex-col gap-3 overflow-y-auto flex-1 min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            {filteredQuests.map((quest) => {
              // Check if task is locally claimed or already claimed from backend
              const isTaskClaimed =
                claimedTasks.has(quest.questId) || quest.claimed;

              return (
                <TaskCard
                  key={quest.id}
                  task={{
                    id: quest.id,
                    questId: quest.questId,
                    quest: quest.quest,
                    completed: quest.completed,
                    progressCount: quest.progressCount,
                    claimed: isTaskClaimed,
                  }}
                  onClaim={(taskId) => {
                    console.log(
                      "Attempting to claim task:",
                      taskId,
                      "Task data:",
                      quest,
                    );

                    // Only allow claiming if task is completed but not claimed
                    if (!quest.completed) {
                      console.log("Task not completed yet");
                      toast.error("Task not completed", {
                        description: "Complete the task requirements first.",
                      });
                      return;
                    }

                    if (isTaskClaimed) {
                      console.log("Task already claimed");
                      toast.error("Already claimed", {
                        description:
                          "You have already claimed this task reward.",
                      });
                      return;
                    }

                    // Set this specific task as claiming
                    setClaimingTaskId(quest.questId);

                    // Show immediate feedback that claiming is in progress
                    toast.loading("Claiming reward...", {
                      description: "Processing your task claim.",
                      id: `claim-${quest.questId}`, // Unique ID to update this toast
                    });

                    // Use the questId (base quest ID) not the progress instance ID
                    claimTaskMutation.mutate(quest.questId, {
                      onSuccess: (data) => {
                        // Mark task as claimed locally
                        setClaimedTasks(
                          (prev) => new Set([...prev, quest.questId]),
                        );
                        setClaimingTaskId(null);
                        console.log(
                          "Task claimed successfully:",
                          quest.questId,
                          data,
                        );

                        // Get reward amount from quest data
                        const rewardAmount =
                          quest.quest?.rewardXp || quest.quest?.reward || 0;

                        // Dismiss loading toast and show success
                        toast.dismiss(`claim-${quest.questId}`);
                        toast.success("Task completed!", {
                          description: `You earned ${rewardAmount} Bananas! Keep up the great work.`,
                        });

                        // Refetch to get updated data
                        questsQuery.refetch();
                      },
                      onError: (error) => {
                        console.error("Claim failed:", error);
                        setClaimingTaskId(null);

                        // Dismiss loading toast and show error
                        toast.dismiss(`claim-${quest.questId}`);

                        // Parse error message for user-friendly feedback
                        const errorMessage =
                          error instanceof Error
                            ? error.message
                            : String(error);

                        if (errorMessage.includes("already claimed")) {
                          toast.error("Already claimed", {
                            description: "This task has already been claimed.",
                          });
                        } else if (errorMessage.includes("not completed")) {
                          toast.error("Task not completed", {
                            description:
                              "Please complete the task requirements first.",
                          });
                        } else if (errorMessage.includes("network")) {
                          toast.error("Network error", {
                            description: "Check your connection and try again.",
                          });
                        } else {
                          toast.error("Claim failed", {
                            description:
                              "Something went wrong. Please try again.",
                          });
                        }

                        // Refresh quest data to get latest status
                        questsQuery.refetch();
                      },
                    });
                  }}
                  isClaimPending={claimingTaskId === quest.questId}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
