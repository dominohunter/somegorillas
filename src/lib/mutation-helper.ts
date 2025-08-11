import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from "@tanstack/react-query";
import api from "./axios";
import { queryKeys, cacheHelpers } from "./keys-helper";

// Type definitions
interface LoginRequest {
  address: string;
  signature: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    address: string;
    // Add other user properties as needed
  };
}

interface AchievementResponse {
  id: string;
  title: string;
  description: string;
  reward: number;
  claimed: boolean;
  xpReward: number;
  // Add other achievement properties as needed
}

interface TaskResponse {
  id: string;
  title: string;
  description: string;
  reward: number;
  completed: boolean;
  // Add other task properties as needed
}

interface ReferralResponse {
  id: string;
  code: string;
  reward: number;
  // Add other referral properties as needed
}

// Generic mutation hook with better typing
export const useApiMutation = <TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, Error, TVariables>,
) => {
  return useMutation({
    mutationFn,
    onError: (error, variables, context) => {
      console.error("Mutation error:", error);
      // Call custom onError if provided
      options?.onError?.(error, variables, context);
    },
    ...options,
  });
};

// Authentication mutations
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useApiMutation<LoginResponse, LoginRequest>(
    async ({ address, signature }) => {
      const response = await api.post("/auth/login", { address, signature });
      const token = response.data.token;
      localStorage.setItem("gorillaz_token", token);
      return response.data;
    },
    {
      onSuccess: () => {
        cacheHelpers.invalidateAllData(queryClient);
      },
    },
  );
};

// Achievement mutations
export const useClaimAchievement = (
  options?: UseMutationOptions<AchievementResponse, Error, string>,
) => {
  const queryClient = useQueryClient();

  return useApiMutation<AchievementResponse, string>(
    async (achievementId) => {
      const response = await api.post(`/achievements/claim/${achievementId}`);
      return response.data;
    },
    {
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.achievements.user(),
        });
        queryClient.invalidateQueries({ queryKey: queryKeys.stats.user() });
        options?.onSuccess?.(data, variables, context);
      },
      ...options,
    },
  );
};

// Quest/Task mutations
export const useClaimTask = () => {
  const queryClient = useQueryClient();

  return useApiMutation<TaskResponse, string>(
    async (questId) => {
      // Use the correct endpoint from backend
      const response = await api.post(`/quests/claim/${questId}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.quests.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.stats.user() });
      },
    },
  );
};

// Referral mutations
export const useSubmitReferral = () => {
  const queryClient = useQueryClient();

  return useApiMutation<ReferralResponse, string>(
    async (referralCode) => {
      const response = await api.post("/referrals", { referralCode });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.referrals.user() });
      },
    },
  );
};

// Logout helper
export const useLogout = () => {
  const queryClient = useQueryClient();

  return () => {
    localStorage.removeItem("gorillaz_token");
    cacheHelpers.removeUserData(queryClient);
  };
};

// Data refresh helper
export const useRefreshData = () => {
  const queryClient = useQueryClient();

  return () => {
    cacheHelpers.invalidateUserData(queryClient);
    cacheHelpers.invalidateGlobalData(queryClient);
  };
};
