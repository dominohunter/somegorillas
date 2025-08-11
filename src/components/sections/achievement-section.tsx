"use client";
import React, { useMemo, useState } from "react";
import AchievementModalCard from "../cards/achievement-modal-card";
import { Achievement } from "@/lib/types";

interface AchievementsProps {
  achievements: Achievement[];
  onClaim: (id: string) => void;
  claimingId?: string;
  className?: string;
  showTitle?: boolean;
  title?: string;
}

type FilterType = "all" | "claimable" | "completed" | "in-progress" | "claimed";

const AchievementsSection: React.FC<AchievementsProps> = ({
  achievements,
  onClaim,
  claimingId,
  className = "",
  showTitle = true,
  title = "Achievements",
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  // Filter achievements based on active filter
  const filteredAchievements = useMemo(() => {
    switch (activeFilter) {
      case "claimable":
        return achievements.filter((a) => a.progress >= a.goal && !a.claimed);
      case "completed":
        return achievements.filter((a) => a.progress >= a.goal);
      case "in-progress":
        return achievements.filter((a) => a.progress < a.goal);
      case "claimed":
        return achievements.filter((a) => a.claimed);
      default:
        return achievements;
    }
  }, [achievements, activeFilter]);

  // Calculate counts for each filter
  const filterCounts = useMemo(() => {
    return {
      all: achievements.length,
      claimable: achievements.filter((a) => a.progress >= a.goal && !a.claimed)
        .length,
      completed: achievements.filter((a) => a.progress >= a.goal).length,
      "in-progress": achievements.filter((a) => a.progress < a.goal).length,
      claimed: achievements.filter((a) => a.claimed).length,
    };
  }, [achievements]);

  const filters: { key: FilterType; label: string; color: string }[] = [
    { key: "all", label: "All", color: "text-light-primary" },
    { key: "claimable", label: "Claimable", color: "text-accent-primary" },
    // { key: "completed", label: "Completed", color: "text-blue-400" },
    { key: "in-progress", label: "In Progress", color: "text-yellow-400" },
    // { key: "claimed", label: "Claimed", color: "text-system-success-primary" },
  ];

  return (
    <div className={` border-translucent-light-4   ${className}`}>
      {showTitle && (
        <div className="mb-6">
          <h2 className="text-h5 text-light-primary text-start leading-loose tracking-tight text-2xl font-semibold">
            {title}
          </h2>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`px-4 py-2 rounded-xl text-sm font-pally font-medium transition-all duration-200 ${
              activeFilter === filter.key
                ? "bg-translucent-light-16 text-light-primary border border-translucent-light-32"
                : "bg-translucent-light-8 text-translucent-light-64 hover:bg-translucent-light-12 border border-translucent-light-4"
            }`}
          >
            {filter.label} ({filterCounts[filter.key]})
          </button>
        ))}
      </div>

      {/* Achievement List */}
      <div className={`space-y-4 ${className?.includes('profile-achievements') ? '' : 'h-[60dvh] overflow-y-auto'} [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`}>
        {filteredAchievements.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-translucent-light-64 text-body-1-medium font-pally">
              No achievements found for this filter.
            </div>
          </div>
        ) : (
          filteredAchievements.map((achievement) => (
            <AchievementModalCard
              key={achievement.id}
              achievement={achievement}
              onClaim={onClaim}
              isClaimPending={claimingId === achievement.id} // Check if this specific achievement is being claimed
            />
          ))
        )}
      </div>

      {/* Quick Actions */}
      {filterCounts.claimable > 0 && activeFilter !== "claimable" && (
        <div className="mt-4 p-3 bg-accent-primary/10 border border-accent-primary/20 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="text-accent-primary text-body-2-medium font-pally">
              You have {filterCounts.claimable} achievement
              {filterCounts.claimable !== 1 ? "s" : ""} ready to claim!
            </div>
            <button
              onClick={() => setActiveFilter("claimable")}
              className="text-accent-primary hover:text-accent-primary/80 text-sm font-pally font-semibold transition-colors"
            >
              View Claimable →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementsSection;
