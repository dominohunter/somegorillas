"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import axios from "axios";
import { API_BASE_URL } from "@/lib/config";
import GlareButton from "@/components/ui/glare-button";

interface DiscordStatus {
  verified: boolean;
  discordUser?: {
    id: string;
    username: string;
    avatar: string;
    verifiedAt: string;
  };
}

export default function DiscordVerificationSection() {
  const [discordStatus, setDiscordStatus] = useState<DiscordStatus | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkDiscordStatus();
  }, []);

  const checkDiscordStatus = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/discord/status`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setDiscordStatus(response.data);
    } catch (error) {
      console.error("Failed to check Discord status:", error);
      setError("Failed to load Discord status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscordVerification = async () => {
    try {
      setIsVerifying(true);
      setError(null);

      const response = await api.get(`/discord/auth-url`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const authUrl = response.data.authUrl;

      // Open Discord auth in popup
      const popup = window.open(
        authUrl,
        "discord-auth",
        "width=500,height=700,scrollbars=yes,resizable=yes",
      );

      // Listen for popup close
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          // Check Discord status after popup closes
          setTimeout(() => {
            checkDiscordStatus();
          }, 1000);
          setIsVerifying(false);
        }
      }, 1000);
    } catch (error) {
      console.error("Failed to start Discord verification:", error);
      setError(
        axios.isAxiosError(error) && error.response?.data?.error 
          ? error.response.data.error 
          : "Failed to start Discord verification",
      );
      setIsVerifying(false);
    }
  };

  const handleUnlinkDiscord = async () => {
    if (
      !confirm(
        "Are you sure you want to unlink your Discord account? This will affect your ability to use referral codes.",
      )
    ) {
      return;
    }

    try {
      setIsUnlinking(true);
      setError(null);

      await axios.delete(`${API_BASE_URL}/discord/unlink`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Refresh status
      await checkDiscordStatus();
    } catch (error) {
      console.error("Failed to unlink Discord:", error);
      setError(
        axios.isAxiosError(error) && error.response?.data?.error 
          ? error.response.data.error 
          : "Failed to unlink Discord account",
      );
    } finally {
      setIsUnlinking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/5 backdrop-blur-[40px] rounded-xl border border-white/10 p-6">
        <div className="flex items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
          <span className="text-gray-400">Loading Discord status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Discord Verification Status */}
      <div className="bg-white/5 backdrop-blur-[40px] rounded-xl border border-white/10 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-3xl">💬</div>
            <div>
              <h3 className="font-semibold text-white">Discord Verification</h3>
              <p className="text-sm text-gray-400">
                Required for referral system and anti-spam protection
              </p>
              {discordStatus?.verified && discordStatus.discordUser && (
                <div className="flex items-center gap-2 mt-2">
                  {discordStatus.discordUser.avatar && (
                    <img
                      src={`https://cdn.discordapp.com/avatars/${discordStatus.discordUser.id}/${discordStatus.discordUser.avatar}.png?size=32`}
                      alt="Discord Avatar"
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="text-sm text-indigo-400 font-medium">
                    {discordStatus.discordUser.username}
                  </span>
                  <span className="text-xs text-gray-500">
                    • Verified{" "}
                    {new Date(
                      discordStatus.discordUser.verifiedAt,
                    ).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {discordStatus?.verified ? (
              <div className="flex items-center gap-3">
                <span className="text-green-400 font-medium flex items-center gap-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 12l2 2 4-4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                  Verified
                </span>
                <GlareButton
                  onClick={handleUnlinkDiscord}
                  background="rgba(239, 68, 68, 0.2)"
                  borderRadius="8px"
                  borderColor="rgba(239, 68, 68, 0.3)"
                  className="px-3 py-1 text-red-400 text-sm"
                  disabled={isUnlinking}
                >
                  {isUnlinking ? "Unlinking..." : "Unlink"}
                </GlareButton>
              </div>
            ) : (
              <GlareButton
                onClick={handleDiscordVerification}
                background="rgba(88, 101, 242, 0.2)"
                borderRadius="8px"
                borderColor="rgba(88, 101, 242, 0.3)"
                className="px-4 py-2 text-indigo-400"
                disabled={isVerifying}
              >
                {isVerifying ? "Verifying..." : "Verify Discord"}
              </GlareButton>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-300 text-xs hover:text-red-200 mt-1"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Referral System Status */}
      <div className="bg-white/5 backdrop-blur-[40px] rounded-xl border border-white/10 p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-2xl">🔗</div>
          <div>
            <h3 className="font-semibold text-white">Referral System</h3>
            <p className="text-sm text-gray-400">
              {discordStatus?.verified
                ? "You can now use and share referral codes"
                : "Discord verification required to use referrals"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div
              className={`text-lg font-bold ${discordStatus?.verified ? "text-green-400" : "text-gray-400"}`}
            >
              {discordStatus?.verified ? "✅ Active" : "❌ Inactive"}
            </div>
            <div className="text-xs text-gray-400">Referral Status</div>
          </div>
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <div
              className={`text-lg font-bold ${discordStatus?.verified ? "text-purple-400" : "text-gray-400"}`}
            >
              {discordStatus?.verified ? "Protected" : "Unprotected"}
            </div>
            <div className="text-xs text-gray-400">Spam Protection</div>
          </div>
        </div>

        {!discordStatus?.verified && (
          <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-400 text-sm">
              ⚠️ Complete Discord verification to access the referral system and
              protect against spam.
            </p>
          </div>
        )}
      </div>

      {/* Benefits Section */}
      <div className="bg-white/5 backdrop-blur-[40px] rounded-xl border border-white/10 p-6">
        <h3 className="font-semibold text-white mb-4">
          🎁 Verification Benefits
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span
              className={`w-2 h-2 rounded-full ${discordStatus?.verified ? "bg-green-400" : "bg-gray-500"}`}
            ></span>
            <span
              className={`text-sm ${discordStatus?.verified ? "text-white" : "text-gray-400"}`}
            >
              Use and share referral codes
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`w-2 h-2 rounded-full ${discordStatus?.verified ? "bg-green-400" : "bg-gray-500"}`}
            ></span>
            <span
              className={`text-sm ${discordStatus?.verified ? "text-white" : "text-gray-400"}`}
            >
              Protected from spam and bots
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`w-2 h-2 rounded-full ${discordStatus?.verified ? "bg-green-400" : "bg-gray-500"}`}
            ></span>
            <span
              className={`text-sm ${discordStatus?.verified ? "text-white" : "text-gray-400"}`}
            >
              Access to community features
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            <span className="text-sm text-white">
              Future exclusive rewards and events
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
