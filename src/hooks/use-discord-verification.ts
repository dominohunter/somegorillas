"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/config";
import { useAuth } from "@/contexts/auth-context";

// Types
interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  verified: boolean;
  email?: string;
  verifiedAt: string;
}

interface DiscordStatus {
  verified: boolean;
  discordUser?: DiscordUser;
  lastChecked?: string;
}

interface DiscordError {
  type:
    | "auth_failed"
    | "network"
    | "server"
    | "cancelled"
    | "popup_blocked"
    | "timeout";
  message: string;
  retryable: boolean;
  code?: string;
}

interface DiscordAuthResponse {
  authUrl: string;
  state?: string;
}

interface DiscordVerificationResult {
  success: boolean;
  verified: boolean;
  user?: DiscordUser;
  error?: DiscordError;
}

//todo: authcontext deer ch bga end ch bga ern adilhan function uud. Bi yum hj uzej bgad orhitsiin. Eniiga bariad yvsan ni zger bh
// Hook implementation
export function useDiscordVerification() {
  // State
  const [discordStatus, setDiscordStatus] = useState<DiscordStatus | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [error, setError] = useState<DiscordError | null>(null);

  // Refs for cleanup
  const popupRef = useRef<Window | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auth context
  const { token, isAuthenticated } = useAuth();

  // Auto-check Discord status when user is authenticated
  useEffect(() => {
    if (isAuthenticated && token && !discordStatus) {
      checkDiscordStatus();
    }
  }, [isAuthenticated, token]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
      popupRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Check Discord verification status
  const checkDiscordStatus = useCallback(
    async (force: boolean = false): Promise<DiscordStatus | null> => {
      if (!token) {
        console.warn(
          "No authentication token available for Discord status check",
        );
        return null;
      }

      // Don't check again if we recently checked (unless forced)
      if (!force && discordStatus?.lastChecked) {
        const lastChecked = new Date(discordStatus.lastChecked);
        const now = new Date();
        const timeDiff = now.getTime() - lastChecked.getTime();
        const minutesDiff = timeDiff / (1000 * 60);

        // If we checked within the last 5 minutes, return cached result
        if (minutesDiff < 5) {
          return discordStatus;
        }
      }

      try {
        setIsCheckingStatus(true);
        setError(null);

        const response = await axios.get(`${API_BASE_URL}/discord/status`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000, // 10 second timeout
        });

        const status: DiscordStatus = {
          ...response.data,
          lastChecked: new Date().toISOString(),
        };

        setDiscordStatus(status);
        return status;
      } catch (err) {
        console.error("Failed to check Discord status:", err);

        let discordError: DiscordError;

        if (axios.isAxiosError(err)) {
          if (err.code === "ECONNABORTED") {
            discordError = {
              type: "timeout",
              message: "Request timed out. Please check your connection.",
              retryable: true,
            };
          } else if (err.response?.status === 401) {
            discordError = {
              type: "auth_failed",
              message: "Authentication failed. Please log in again.",
              retryable: false,
            };
          } else if (err.response?.status && err.response.status >= 500) {
            discordError = {
              type: "server",
              message: "Server error. Please try again later.",
              retryable: true,
            };
          } else if (!navigator.onLine) {
            discordError = {
              type: "network",
              message: "No internet connection. Please check your network.",
              retryable: true,
            };
          } else {
            discordError = {
              type: "network",
              message: "Failed to check Discord status. Please try again.",
              retryable: true,
            };
          }
        } else {
          discordError = {
            type: "server",
            message: "An unexpected error occurred.",
            retryable: true,
          };
        }

        setError(discordError);

        // Set default status on error
        const fallbackStatus: DiscordStatus = {
          verified: false,
          lastChecked: new Date().toISOString(),
        };
        setDiscordStatus(fallbackStatus);

        return fallbackStatus;
      } finally {
        setIsCheckingStatus(false);
      }
    },
    [token, discordStatus],
  );

  // Get Discord authorization URL
  const getDiscordAuthUrl =
    useCallback(async (): Promise<DiscordAuthResponse> => {
      if (!token) {
        throw new Error("No authentication token available");
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/discord/auth-url`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        });

        return response.data;
      } catch (err: unknown) {
        console.error("Failed to get Discord auth URL:", err);

        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            throw new Error("Authentication failed. Please log in again.");
          } else if (err.response?.status && err.response.status >= 500) {
            throw new Error("Server error. Please try again later.");
          } else if (err.code === "ECONNABORTED") {
            throw new Error("Request timed out. Please check your connection.");
          }
        }

        throw new Error(
          "Failed to get Discord authorization URL. Please try again.",
        );
      }
    }, [token]);

  // Start Discord verification process
  const startDiscordVerification =
    useCallback(async (): Promise<DiscordVerificationResult> => {
      setIsLoading(true);
      setError(null);
      cleanup(); // Clean up any existing popups/intervals

      try {
        // Get auth URL
        const authData = await getDiscordAuthUrl();

        // Open popup
        const popup = window.open(
          authData.authUrl,
          "discord-auth",
          "width=500,height=700,scrollbars=yes,resizable=yes,left=" +
            (window.screen.width / 2 - 250) +
            ",top=" +
            (window.screen.height / 2 - 350),
        );

        if (!popup) {
          const error: DiscordError = {
            type: "popup_blocked",
            message:
              "Popup was blocked. Please allow popups for this site and try again.",
            retryable: true,
          };
          setError(error);
          return {
            success: false,
            verified: false,
            error,
          };
        }

        popupRef.current = popup;

        // Return promise that resolves when verification completes
        return new Promise<DiscordVerificationResult>((resolve) => {
          let resolved = false;

          const resolveOnce = (result: DiscordVerificationResult) => {
            if (resolved) return;
            resolved = true;
            cleanup();
            resolve(result);
          };

          // Poll for popup closure
          intervalRef.current = setInterval(async () => {
            if (popup.closed) {
              // Popup closed, check verification status
              try {
                const status = await checkDiscordStatus(true);

                if (status?.verified) {
                  resolveOnce({
                    success: true,
                    verified: true,
                    user: status.discordUser,
                  });
                } else {
                  const error: DiscordError = {
                    type: "cancelled",
                    message: "Discord verification was cancelled or failed.",
                    retryable: true,
                  };
                  setError(error);
                  resolveOnce({
                    success: false,
                    verified: false,
                    error,
                  });
                }
              } catch {
                const error: DiscordError = {
                  type: "server",
                  message:
                    "Failed to verify Discord status after authentication.",
                  retryable: true,
                };
                setError(error);
                resolveOnce({
                  success: false,
                  verified: false,
                  error,
                });
              }
            }
          }, 1000);

          // Set timeout (5 minutes)
          timeoutRef.current = setTimeout(() => {
            if (!popup.closed) {
              popup.close();
            }

            const error: DiscordError = {
              type: "timeout",
              message: "Discord verification timed out. Please try again.",
              retryable: true,
            };
            setError(error);
            resolveOnce({
              success: false,
              verified: false,
              error,
            });
          }, 300000); // 5 minutes

          // Listen for popup messages (optional, for better UX)
          const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;

            if (event.data.type === "DISCORD_AUTH_SUCCESS") {
              // Handle success message from popup
              checkDiscordStatus(true).then((status) => {
                resolveOnce({
                  success: true,
                  verified: status?.verified || false,
                  user: status?.discordUser,
                });
              });
            } else if (event.data.type === "DISCORD_AUTH_ERROR") {
              // Handle error message from popup
              const error: DiscordError = {
                type: "auth_failed",
                message: event.data.message || "Discord authentication failed.",
                retryable: true,
              };
              setError(error);
              resolveOnce({
                success: false,
                verified: false,
                error,
              });
            }
          };

          window.addEventListener("message", handleMessage);

          // Cleanup message listener when done
          const originalResolve = resolve;
          resolve = (result) => {
            window.removeEventListener("message", handleMessage);
            originalResolve(result);
          };
        });
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        const discordError: DiscordError = {
          type: errorMessage.includes("popup")
            ? "popup_blocked"
            : errorMessage.includes("timeout")
              ? "timeout"
              : errorMessage.includes("Authentication")
                ? "auth_failed"
                : "network",
          message: errorMessage || "Failed to start Discord verification",
          retryable: true,
        };

        setError(discordError);
        return {
          success: false,
          verified: false,
          error: discordError,
        };
      } finally {
        setIsLoading(false);
      }
    }, [getDiscordAuthUrl, checkDiscordStatus, cleanup]);

  // Force refresh Discord status
  const refreshDiscordStatus =
    useCallback(async (): Promise<DiscordStatus | null> => {
      return checkDiscordStatus(true);
    }, [checkDiscordStatus]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cancel ongoing verification
  const cancelVerification = useCallback(() => {
    cleanup();
    setIsLoading(false);
    setError(null);
  }, [cleanup]);

  // Retry verification
  const retryVerification =
    useCallback(async (): Promise<DiscordVerificationResult> => {
      clearError();
      return startDiscordVerification();
    }, [clearError, startDiscordVerification]);

  // Public API
  return {
    // Status
    discordStatus,
    isVerified: discordStatus?.verified || false,
    discordUser: discordStatus?.discordUser || null,

    // Loading states
    isLoading,
    isCheckingStatus,

    // Error state
    error,

    // Actions
    checkDiscordStatus,
    getDiscordAuthUrl,
    startDiscordVerification,
    refreshDiscordStatus,
    cancelVerification,
    retryVerification,
    clearError,

    // Utils
    needsVerification: !discordStatus?.verified,
    lastChecked: discordStatus?.lastChecked,
  };
}
