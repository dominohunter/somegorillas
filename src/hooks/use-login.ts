"use client";

import { useState } from "react";
import { useSignMessage } from "wagmi";
import axios from "axios";
import { API_BASE_URL } from "@/lib/config";

interface LoginError {
  type: "wallet" | "signature" | "server" | "network";
  message: string;
  retryable: boolean;
}

interface LoginResult {
  success: boolean;
  token?: string;
  error?: LoginError;
}

//todo: ehnii render deer chainid tai holbootoi error ogj bga teriig zasah. Error handler ajillahgui frontend shuud loop hged ble.
export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<LoginError | null>(null);
  const { signMessageAsync } = useSignMessage();

  const login = async (address: string): Promise<LoginResult> => {
    if (!address) {
      throw new Error("No wallet address provided");
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create a simple message to sign
      const message = `Sign this message to login: ${address}`;

      // Step 1: Sign the message
      let signature: string;
      try {
        signature = await signMessageAsync({ message });
      } catch (signError: unknown) {
        if (
          (signError instanceof Error &&
            signError.message?.includes("User rejected")) ||
          (signError &&
            typeof signError === "object" &&
            "name" in signError &&
            signError.name === "UserRejectedRequestError")
        ) {
          const rejectionError: LoginError = {
            type: "signature",
            message: "Signature was rejected. Please try again.",
            retryable: true,
          };
          setError(rejectionError);
          return {
            success: false,
            error: rejectionError,
          };
        }
        throw new Error("Failed to sign message. Please try again.");
      }

      // Step 2: Send to backend for verification
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        address,
        signature,
        message,
      });

      const { token } = loginResponse.data;

      if (token) {
        // Store token in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("gorillaz_token", token);
        }

        return {
          success: true,
          token,
        };
      } else {
        throw new Error("No token received from server");
      }
    } catch (err: unknown) {
      let loginError: LoginError;

      if (axios.isAxiosError(err)) {
        if (err.code === "NETWORK_ERROR" || !navigator.onLine) {
          loginError = {
            type: "network",
            message: "Network connection failed. Please check your internet.",
            retryable: true,
          };
        } else if (err.response?.status === 429) {
          loginError = {
            type: "server",
            message: "Too many login attempts. Please wait a moment.",
            retryable: true,
          };
        } else if (err.response?.status && err.response.status >= 500) {
          loginError = {
            type: "server",
            message: "Server error. Please try again later.",
            retryable: true,
          };
        } else if (err.response?.status === 401) {
          loginError = {
            type: "signature",
            message: "Invalid signature. Please try again.",
            retryable: true,
          };
        } else {
          loginError = {
            type: "server",
            message:
              err.response?.data?.error || "Login failed. Please try again.",
            retryable: true,
          };
        }
      } else {
        loginError = {
          type: "wallet",
          message:
            err instanceof Error
              ? err.message
              : "An unexpected error occurred.",
          retryable: true,
        };
      }

      setError(loginError);
      return {
        success: false,
        error: loginError,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    login,
    isLoading,
    error,
    clearError,
  };
}
