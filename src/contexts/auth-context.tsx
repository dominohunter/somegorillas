"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { useAccount, useDisconnect } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { useStats } from "@/lib/query-helper";
import { UserStats } from "@/lib/types";
import axios from "axios";
import { API_BASE_URL } from "@/lib/config";

interface DiscordStatus {
  verified: boolean;
  discordUser?: {
    id: string;
    username: string;
    avatar: string;
    verifiedAt: string;
  };
}

interface AuthContextType {
  // Wallet state
  address: string | undefined;
  isConnected: boolean;

  // Auth state
  token: string | null;
  user: UserStats | null;
  isAuthenticated: boolean;
  isFullyAuthenticated: boolean;
  isLoading: boolean;

  // Discord state
  discordStatus: DiscordStatus | null;
  isDiscordVerified: boolean;
  isDiscordLoading: boolean;

  // Actions
  logout: () => void;
  refreshToken: () => void;
  checkDiscordStatus: () => Promise<void>;
  getDiscordAuthUrl: () => Promise<string>;
  unlinkDiscord: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [discordStatus, setDiscordStatus] = useState<DiscordStatus | null>(
    null,
  );
  const [isDiscordLoading, setIsDiscordLoading] = useState(false);
  const queryClient = useQueryClient();

  // Fetch user stats only when we have a token
  const userQuery = useStats();

  // Function to read token from localStorage
  const refreshToken = useCallback(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("gorillaz_token");
      setToken(stored);
    }
  }, []);

  // Function to check Discord verification status
  const checkDiscordStatus = useCallback(async () => {
    if (!token) return;

    setIsDiscordLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/discord/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDiscordStatus(response.data);
    } catch (error) {
      console.error("Failed to check Discord status:", error);
      setDiscordStatus({ verified: false });
    } finally {
      setIsDiscordLoading(false);
    }
  }, [token]);

  //todo:discord iin helper function uud end bh shaardlagagui bh. Zovhon login hiih uyd duudaj bga bolhor home content ch yumu

  // Function to get Discord auth URL
  const getDiscordAuthUrl = useCallback(async (): Promise<string> => {
    if (!token) throw new Error("No authentication token");

    try {
      const response = await axios.get(`${API_BASE_URL}/discord/auth-url`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.authUrl;
    } catch (error) {
      console.error("Failed to get Discord auth URL:", error);
      throw new Error("Failed to get Discord authorization URL");
    }
  }, [token]);

  // Function to unlink Discord account
  const unlinkDiscord = useCallback(async () => {
    if (!token) return;

    setIsDiscordLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/discord/unlink`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDiscordStatus({ verified: false });
    } catch (error) {
      console.error("Failed to unlink Discord:", error);
      throw new Error("Failed to unlink Discord account");
    } finally {
      setIsDiscordLoading(false);
    }
  }, [token]);

  // Initialize token from localStorage on mount
  useEffect(() => {
    refreshToken();
    setIsInitialized(true);
  }, [refreshToken]);

  // Check Discord status when token changes
  useEffect(() => {
    if (token && isInitialized) {
      checkDiscordStatus();
    }
  }, [token, isInitialized, checkDiscordStatus]);

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("gorillaz_token");
    }
    setToken(null);
    setDiscordStatus(null);
    queryClient.clear();
    disconnect();
    router.push("/");
  }, [queryClient, disconnect, router]);

  const isDiscordVerified = discordStatus?.verified ?? false;
  const isAuthenticated = !!token && !!userQuery.data;
  const isFullyAuthenticated = isAuthenticated && isDiscordVerified;

  const value: AuthContextType = {
    // Wallet state
    address,
    isConnected,

    // Auth state
    token,
    user: userQuery.data || null,
    isAuthenticated: isAuthenticated,
    isFullyAuthenticated: isFullyAuthenticated,
    isLoading: !isInitialized || userQuery.isLoading || isDiscordLoading,

    // Discord state
    discordStatus,
    isDiscordVerified,
    isDiscordLoading,

    // Actions
    logout,
    refreshToken,
    checkDiscordStatus,
    getDiscordAuthUrl,
    unlinkDiscord,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
