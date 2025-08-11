// Query Keys - Centralized management for React Query cache keys
// This ensures consistency and helps with cache invalidation

import { QueryClient } from "@tanstack/react-query";

export const queryKeys = {
  // Auth related
  auth: ["auth"] as const,

  // User stats
  stats: {
    all: ["stats"] as const,
    user: () => [...queryKeys.stats.all, "user"] as const,
    global: () => [...queryKeys.stats.all, "global"] as const,
  },

  // Achievements
  achievements: {
    all: ["achievements"] as const,
    user: () => [...queryKeys.achievements.all, "user"] as const,
    byId: (id: string) =>
      [...queryKeys.achievements.all, "detail", id] as const,
  },

  // Quests/Tasks
  quests: {
    all: ["quests"] as const,
    byUser: (address: string) =>
      [...queryKeys.quests.all, "user", address] as const,
  },

  // Referrals
  referrals: {
    all: ["referrals"] as const,
    user: () => [...queryKeys.referrals.all, "user"] as const,
  },

  // Flip/Game data
  flips: {
    all: ["flips"] as const,
    history: () => [...queryKeys.flips.all, "history"] as const,
    userHistory: () => [...queryKeys.flips.all, "history", "user"] as const,
    globalHistory: () => [...queryKeys.flips.all, "history", "global"] as const,
    count: () => [...queryKeys.flips.all, "count"] as const,
    userCount: () => [...queryKeys.flips.all, "count", "user"] as const,
    userLimit: () => [...queryKeys.flips.all, "limit", "user"] as const,
  },

  // Leaderboard
  leaderboard: {
    all: ["leaderboard"] as const,
    global: () => [...queryKeys.leaderboard.all, "global"] as const,
  },
} as const;

// Helper functions for common cache operations
export const cacheHelpers = {
  // Invalidate all user-specific data
  invalidateUserData: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.stats.user() });
    queryClient.invalidateQueries({ queryKey: queryKeys.achievements.user() });
    queryClient.invalidateQueries({ queryKey: queryKeys.referrals.user() });
    queryClient.invalidateQueries({ queryKey: queryKeys.flips.userHistory() });
    queryClient.invalidateQueries({ queryKey: queryKeys.flips.userCount() });
  },

  // Invalidate all global data
  invalidateGlobalData: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.stats.global() });
    queryClient.invalidateQueries({ queryKey: queryKeys.leaderboard.global() });
  },

  // Invalidate all data (full refresh)
  invalidateAllData: (queryClient: QueryClient) => {
    queryClient.invalidateQueries();
  },

  // Remove user data from cache (on logout)
  removeUserData: (queryClient: QueryClient) => {
    queryClient.removeQueries({ queryKey: queryKeys.stats.user() });
    queryClient.removeQueries({ queryKey: queryKeys.achievements.user() });
    queryClient.removeQueries({ queryKey: queryKeys.referrals.user() });
    queryClient.removeQueries({ queryKey: queryKeys.flips.userHistory() });
    queryClient.removeQueries({ queryKey: queryKeys.flips.userCount() });
    queryClient.removeQueries({ queryKey: queryKeys.quests.all });
  },
};

// Type helpers for better TypeScript support
export type QueryKey = typeof queryKeys;
export type StatsQueryKey = typeof queryKeys.stats;
export type AchievementsQueryKey = typeof queryKeys.achievements;
export type QuestsQueryKey = typeof queryKeys.quests;
export type ReferralsQueryKey = typeof queryKeys.referrals;
export type FlipsQueryKey = typeof queryKeys.flips;
export type LeaderboardQueryKey = typeof queryKeys.leaderboard;
