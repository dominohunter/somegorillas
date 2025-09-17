"use client";

import { useState, useMemo } from "react";
import { useAchievements } from "@/lib/query-helper";
import { useClaimAchievement } from "@/lib/mutation-helper";
import AchievementCard from "@/components/cards/achievement-card";
import AchievementsModal from "@/components/modals/achievements-modal";
import AchievementClaimModal from "@/components/modals/achievement-claim-modal";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/keys-helper";
import { useAuth } from "@/contexts/auth-context";

export default function Achievements() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimedAchievement, setClaimedAchievement] = useState<{
    id: string;
    title: string;
    description: string;
    xpReward: number;
  } | null>(null);

  const achievementsQuery = useAchievements();
  
  // Debug logging
  console.log("Auth State:", {
    isAuthenticated: auth.isAuthenticated,
    token: auth.token ? "exists" : "missing",
    user: auth.user ? "exists" : "missing",
    isLoading: auth.isLoading
  });
  console.log("Achievements Query:", {
    data: achievementsQuery.data,
    isLoading: achievementsQuery.isLoading,
    error: achievementsQuery.error,
    isSuccess: achievementsQuery.isSuccess
  });
  const claimMutation = useClaimAchievement({
    onSuccess: (data, achievementId) => {
      // Find the achievement that was claimed
      const achievement = achievementsQuery.data?.find(
        (a) => a.id === achievementId,
      );
      if (achievement) {
        setClaimedAchievement({
          id: achievement.id,
          title: achievement.title,
          description: achievement.description,
          xpReward: achievement.xpReward,
        });
        setClaimModalOpen(true);
        queryClient.invalidateQueries({ queryKey: queryKeys.stats.user() });
        queryClient.invalidateQueries({
          queryKey: queryKeys.achievements.user(),
        });
      }
    },
  });

  // Calculate achievement statistics
  const achievementStats = useMemo(() => {
    if (!achievementsQuery.data)
      return { total: 0, completed: 0, claimed: 0, totalXP: 0 };

    const total = achievementsQuery.data.length;
    const completed = achievementsQuery.data.filter(
      (a) => a.progress >= a.goal,
    ).length;
    const claimed = achievementsQuery.data.filter((a) => a.claimed).length;
    const totalXP = achievementsQuery.data.reduce(
      (sum, a) => sum + (a.claimed ? a.xpReward : 0),
      0,
    );

    return { total, completed, claimed, totalXP };
  }, [achievementsQuery.data]);

  // Sort achievements: claimable first, then completed, then in progress
  const sortedAchievements = useMemo(() => {
    if (!achievementsQuery.data) return [];

    return [...achievementsQuery.data].sort((a, b) => {
      // Claimable achievements first
      const aClaimable = a.progress >= a.goal && !a.claimed;
      const bClaimable = b.progress >= b.goal && !b.claimed;

      if (aClaimable && !bClaimable) return -1;
      if (!aClaimable && bClaimable) return 1;

      // Then claimed achievements
      if (a.claimed && !b.claimed) return -1;
      if (!a.claimed && b.claimed) return 1;

      // Then by progress percentage
      const aProgress = a.progress / a.goal;
      const bProgress = b.progress / b.goal;

      return bProgress - aProgress;
    });
  }, [achievementsQuery.data]);

  if (achievementsQuery.isLoading) {
    return (
      <div className="p-4 bg-translucent-dark-12 border-2 backdrop-blur-[60px] flex flex-col gap-3 rounded-3xl border-translucent-light-4">
        <div className="">
          {/* Header skeleton */}
          <div className="flex justify-between items-center mb-4">
            <div className="h-6 bg-translucent-light-16 rounded w-24"></div>
            <div className="h-4 bg-translucent-light-16 rounded w-32"></div>
          </div>

          {/* Stats skeleton */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="text-center p-3 bg-translucent-light-8 rounded-xl"
              >
                <div className="h-6 bg-translucent-light-16 rounded w-8 mx-auto mb-1"></div>
                <div className="h-3 bg-translucent-light-16 rounded w-12 mx-auto"></div>
              </div>
            ))}
          </div>

          {/* Achievement cards skeleton */}
          <div className="flex md:grid md:grid-cols-2 gap-3 overflow-x-auto overflow-y-hidden md:overflow-y-auto">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="border-2 border-translucent-light-4 bg-translucent-light-8 rounded-[24px] p-4 flex items-center justify-center aspect-square w-[180px] h-[180px] md:w-auto md:h-auto min-w-[180px]"
              >
                {/* Achievement coin skeleton */}
                <div className="w-[120px] h-[120px] bg-translucent-light-16 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated && !auth.isLoading) {
    return (
      <div className="p-4 bg-translucent-dark-12 border-2 backdrop-blur-[60px] flex flex-col gap-3 rounded-3xl border-translucent-light-4">
        <div className="text-center text-translucent-light-64">
          <h2 className="text-h5 font-[600] mb-2 text-light-primary">Achievements</h2>
          <p className="text-sm">Please sign in with your wallet to view achievements</p>
        </div>
      </div>
    );
  }

  if (achievementsQuery.error) {
    return (
      <div className="p-4 bg-translucent-dark-12 border-2 backdrop-blur-[60px] flex flex-col gap-3 rounded-3xl border-translucent-light-4">
        <div className="text-center text-system-error-primary">
          <h2 className="text-h5 font-[600] mb-2">Error Loading Achievements</h2>
          <p className="text-sm">{achievementsQuery.error?.message || "Failed to load achievements"}</p>
        </div>
      </div>
    );
  }

  //todo: achievement card arai deer haragddag bolgoh
  return (
    <div className="p-4 bg-translucent-dark-12  border-2 backdrop-blur-[60px] flex flex-col gap-3 overflow-hidden rounded-3xl border-translucent-light-4 lg:flex-1 lg:h-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-h5 font-[600] text-light-primary">Achievements</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-translucent-light-64 hover:text-light-primary transition-colors text-sm font-pally"
        >
          View All →
        </button>
      </div>

      {/* Achievement Statistics */}
      <div className="grid grid-cols-4 gap-2 mb-2">
        <div className="text-center p-3 bg-translucent-light-8 rounded-xl border border-translucent-light-4">
          <div className="text-light-primary text-h6 font-semibold">
            {achievementStats.total}
          </div>
          <div className="text-translucent-light-64 text-caption-2-medium font-pally">
            Total
          </div>
        </div>
        <div className="text-center p-3 bg-translucent-light-8 rounded-xl border border-translucent-light-4">
          <div className="text-light-primary text-h6 font-semibold">
            {achievementStats.completed}
          </div>
          <div className="text-translucent-light-64 text-caption-2-medium font-pally">
            Completed
          </div>
        </div>
        <div className="text-center p-3 bg-translucent-light-8 rounded-xl border border-translucent-light-4">
          <div className="text-system-success-primary text-h6 font-semibold">
            {achievementStats.claimed}
          </div>
          <div className="text-translucent-light-64 text-caption-2-medium font-pally">
            Claimed
          </div>
        </div>
        <div className="text-center p-3 bg-translucent-light-8 rounded-xl border border-translucent-light-4">
          <div className="text-accent-primary text-h6 font-semibold">
            {achievementStats.totalXP}
          </div>
          <div className="text-translucent-light-64 text-caption-2-medium font-pally">
            Bananas
          </div>
        </div>
      </div>

      {/* Achievement Cards */}
      <div className="flex lg:grid lg:grid-cols-2 gap-3 overflow-x-auto overflow-y-hidden lg:overflow-y-auto lg:overflow-x-visible [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {sortedAchievements.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            onClaim={(id) => claimMutation.mutate(id)}
            isClaimPending={claimMutation.isPending}
            onClick={() => setIsModalOpen(true)}
          />
        ))}
      </div>

      {/* Modals */}
      <AchievementsModal
        isModalOpen={isModalOpen}
        setIsModalOpen={() => setIsModalOpen(false)}
        achievements={sortedAchievements}
        onClaim={(id) => claimMutation.mutate(id)}
        isClaimPending={claimMutation.isPending}
      />

      <AchievementClaimModal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        achievement={claimedAchievement}
      />
    </div>
  );
}
