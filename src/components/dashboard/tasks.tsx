"use client";

import { useQuests, useReferral } from "@/lib/query-helper";
import { useClaimTask } from "@/lib/mutation-helper";
import { useAccount } from "wagmi";
import TaskCard from "@/components/cards/task-card";
import GlareButton from "@/components/ui/glare-button";
import AddFriend from "@/components/icons/add-friend";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function Tasks() {
  const { address } = useAccount();
  const questsQuery = useQuests(address);
  const referralQuery = useReferral();
  const claimTaskMutation = useClaimTask();
  const [isCopied, setIsCopied] = useState(false);
  const [claimedTasks, setClaimedTasks] = useState<Set<string>>(new Set());
  const [claimingTaskId, setClaimingTaskId] = useState<string | null>(null);

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

  const handleCopyReferralLink = async () => {
    if (referralQuery.data?.referralCode) {
      const referralLink = `${window.location.origin}?ref=${referralQuery.data.referralCode}`;
      try {
        await navigator.clipboard.writeText(referralLink);
        setIsCopied(true);
        // Success feedback for copying referral link
        toast.success("Referral link copied!", {
          description: "Share this link with friends to earn rewards.",
        });

        setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
      } catch (err) {
        console.error("Failed to copy: ", err);
      }
    }
  };

  // if (questsQuery.isLoading || referralQuery.isLoading) {
  //   return (
  //     <div className="space-y-6">
  //       {/* Tasks Loading */}
  //       <div className="p-4 bg-translucent-dark-12 border-2 backdrop-blur-[60px] flex flex-col gap-3 rounded-3xl border-translucent-light-4 ">
  //         <div className="">
  //           {/* Header skeleton */}
  //           <div className="flex justify-between mb-3">
  //             <div className="h-6 bg-translucent-light-16 rounded w-16"></div>
  //             <div className="h-4 bg-translucent-light-16 rounded w-32"></div>
  //           </div>
  //           {/* Task cards skeleton */}
  //           <div className="flex gap-3 overflow-x-auto">
  //             {[...Array(3)].map((_, i) => (
  //               <div
  //                 key={i}
  //                 className="border-2 border-translucent-light-4 bg-translucent-light-8 rounded-2xl p-4 flex flex-col items-center gap-4 min-w-[200px]"
  //               >
  //                 {/* Coin skeleton */}
  //                 <div className="flex-shrink-0 bg-translucent-light-12 border-translucent-light-4 border-2 p-10 rounded-[12px]">
  //                   <div className="w-[180px] h-[180px] bg-translucent-light-16 rounded"></div>
  //                 </div>
  //                 {/* Text skeleton */}
  //                 <div className="flex-1 space-y-2">
  //                   <div className="h-5 bg-translucent-light-16 rounded w-24"></div>
  //                   <div className="h-4 bg-translucent-light-16 rounded w-20"></div>
  //                 </div>
  //                 {/* Button skeleton */}
  //                 <div className="w-full h-12 bg-translucent-light-16 rounded-[8px]"></div>
  //               </div>
  //             ))}
  //           </div>
  //         </div>

  //         {/* Referral section skeleton */}
  //         <div className="">
  //           <div className="space-y-3">
  //             {/* Horizontal referral card skeleton */}
  //             <div className="flex items-center gap-4 p-4 bg-translucent-light-8 border-2 border-translucent-light-4 rounded-2xl">
  //               {/* Icon skeleton */}
  //               <div className="flex-shrink-0 bg-translucent-light-12 border-translucent-light-4 border-2 p-2 rounded-[12px] w-16 h-16">
  //                 <div className="w-12 h-12 bg-translucent-light-16 rounded"></div>
  //               </div>
  //               {/* Text skeleton */}
  //               <div className="flex-1 space-y-2">
  //                 <div className="h-5 bg-translucent-light-16 rounded w-32"></div>
  //                 <div className="h-4 bg-translucent-light-16 rounded w-40"></div>
  //               </div>
  //               {/* Button skeleton */}
  //               <div className="w-40 h-12 bg-translucent-light-16 rounded-[12px]"></div>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-6">
      {/* Tasks Section */}
      <div className="p-4 bg-translucent-dark-12 border-2 backdrop-blur-[60px] flex flex-col gap-3 rounded-3xl border-translucent-light-4">
        <div className="flex justify-between">
          <h2 className="text-h5 font-[600] text-light-primary">Tasks</h2>
          <p className="font-pally text-translucent-light-64">
            New task in {timeUntilReset}
          </p>
        </div>
        {questsQuery.data && (
          <div
            ref={scrollContainerRef}
            className="flex gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            {questsQuery.data.map((quest) => {
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
                        toast.success("Task completed! 🎉", {
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

        <div className="p-4 bg-translucent-dark-12 border-2 backdrop-blur-[60px] flex flex-col gap-3 rounded-3xl border-translucent-light-4">
          {referralQuery.data && (
            <div className="space-y-3">
              {/* Horizontal Referral Card */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-translucent-light-8 border-2 border-translucent-light-4 rounded-2xl">
                {/* Add Friend Icon in Square Container */}
                <div className="flex-shrink-0 bg-translucent-light-12 border-translucent-light-4 border-2 p-2 rounded-[12px] w-16 h-16 flex items-center justify-center">
                  <AddFriend size={48} />
                </div>

                {/* Middle Text */}
                <div className="flex-1 text-center sm:text-start">
                  <p className="text-light-primary text-body1 font-semibold">
                    Get 50 bananas for free
                  </p>
                  <p className="text-translucent-light-64 text-body2-medium font-pally">
                    Invite your friend and get 50 bananas
                  </p>
                </div>

                {/* Copy Button */}
                <GlareButton
                  onClick={handleCopyReferralLink}
                  background={isCopied ? "#22C55E" : "#EAB308"}
                  borderRadius="12px"
                  borderColor="transparent"
                  glareColor="#ffffff"
                  glareOpacity={0.3}
                  className="text-white py-3 px-4 sm:px-6 text-body-2-semibold font-pally font-semibold w-full sm:w-auto"
                  disabled={isCopied}
                >
                  {isCopied ? "Copied!" : "Copy Link"}
                </GlareButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
