import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import api from "./axios";
import { queryKeys } from "./keys-helper";
import {
  Achievement,
  FlipHistory,
  GlobalStats,
  LeaderboardEntry,
  Referral,
  SystemStatus,
  UserQuest,
  UserRemainingFlip,
  UserStats,
} from "./types";

// Type definitions

// Hook to check if we're on client side (for SSR compatibility)
export const useIsClient = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
};

// Generic query hook for authenticated endpoints
export const useAuthQuery = <T>(
  queryKey: readonly string[],
  endpoint: string,
  options?: Omit<UseQueryOptions<T>, "queryKey" | "queryFn">,
) => {
  const isClient = useIsClient();

  return useQuery({
    queryKey,
    queryFn: async (): Promise<T> => {
      const response = await api.get(endpoint);
      return response.data;
    },
    enabled:
      isClient &&
      typeof window !== "undefined" &&
      !!localStorage.getItem("gorillaz_token"),
    ...options,
  });
};

// Generic query hook for public endpoints
export const usePublicQuery = <T>(
  queryKey: readonly string[],
  endpoint: string,
  options?: Omit<UseQueryOptions<T>, "queryKey" | "queryFn">,
) => {
  const isClient = useIsClient();

  return useQuery({
    queryKey,
    queryFn: async (): Promise<T> => {
      const response = await api.get(endpoint);
      return response.data;
    },
    enabled: isClient,
    ...options,
  });
};

// Specific query hooks
export const useStats = () => {
  return useAuthQuery<UserStats>(queryKeys.stats.user(), "/stats/me");
};

export const useGlobalStats = () => {
  return useAuthQuery<GlobalStats>(queryKeys.stats.global(), "/stats/global");
};

export const useAchievements = () => {
  return useAuthQuery<Achievement[]>(
    queryKeys.achievements.user(),
    "/achievements/me",
  );
};

export const useQuests = (address?: string) => {
  return useAuthQuery<UserQuest[]>(
    queryKeys.quests.byUser(address || ""),
    `/quests/${address}`,
    {
      enabled: !!address,
    },
  );
};

export const useReferral = () => {
  return useAuthQuery<Referral>(queryKeys.referrals.user(), "/referrals/me");
};

export const useFlipHistory = () => {
  return useAuthQuery<FlipHistory[]>(
    queryKeys.flips.userHistory(),
    "/stats/flip-history/me",
  );
};

export const useFlipRemaing = () => {
  return useAuthQuery<UserRemainingFlip>(
    queryKeys.flips.userLimit(),
    "/stats/flip-count/me",
  );
};

export const useGlobalFlipHistory = () => {
  return usePublicQuery<FlipHistory[]>(
    queryKeys.flips.globalHistory(),
    "/stats/flip-history/global",
  );
};

export const useLeaderboard = () => {
  return usePublicQuery<LeaderboardEntry[]>(
    queryKeys.leaderboard.global(),
    "/leaderboard",
  );
};

export function useSystemHealth() {
  const [showWarning, setShowWarning] = useState(false);

  const healthQuery = useQuery<SystemStatus>({
    queryKey: ["system-status"],
    queryFn: async () => {
      const response = await api.get("/polling/status");
      return response.data;
    },
    refetchInterval: 30000, // Check every 30 seconds
    retry: 3,
    retryDelay: 1000,
    staleTime: 25000, // Consider data stale after 25 seconds
  });

  const isHealthy = healthQuery.data?.isHealthy ?? true; // Default to healthy if no data
  const hasRecentActivity =
    healthQuery.data?.activity?.hasRecentActivity ?? true;

  // Show warning if system is unhealthy
  useEffect(() => {
    if (healthQuery.data && !isHealthy) {
      setShowWarning(true);
    } else if (isHealthy) {
      setShowWarning(false);
    }
  }, [isHealthy, healthQuery.data]);

  return {
    isHealthy,
    hasRecentActivity,
    showWarning,
    healthData: healthQuery.data,
    isLoading: healthQuery.isLoading,
    error: healthQuery.error,
  };
}
