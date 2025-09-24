"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GlareButton } from "@/components/ui/glare-button";
import LoadingScreen from "@/components/screens/loading-screen";
import { useReferral, submitReferralCode } from "@/lib/query-helper";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/keys-helper";
import CheckCircle from "@/components/icons/check-circle";
import Globe from "@/components/icons/globe";
import Twitter from "@/components/icons/twitter";
import { toast } from "sonner";
import Discord from "@/components/icons/discord";
import { CartoonButton } from "@/components/ui/cartoon-button";

export default function Profile() {
  const {
    user,
    isAuthenticated,
    isLoading,
    discordStatus,
    isDiscordVerified,
    isDiscordLoading,
    unlinkDiscord,
    getDiscordAuthUrl,
    checkDiscordStatus,
  } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isClient, setIsClient] = useState(false);

  const [activeTab, setActiveTab] = useState<"social">("social");
  const [referralCode, setReferralCode] = useState("");
  const [isSubmittingReferral, setIsSubmittingReferral] = useState(false);
  const [hasSubmittedReferral, setHasSubmittedReferral] = useState(false);

  const referralQuery = useReferral();

  // Sort achievements: claimable first, then completed, then in progress

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isAuthenticated && !isLoading) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router, isClient]);

  if (!isClient || isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleCopyReferralCode = async () => {
    console.log("Referral data:", referralQuery.data);

    // Try both possible property names
    const codeToBytes =
      referralQuery.data?.referralCode || referralQuery.data?.code;

    if (!codeToBytes) {
      console.error("No referral code found in data:", referralQuery.data);
      toast.error("No referral code available");
      return;
    }

    console.log("Copying referral code:", codeToBytes);

    let copySuccessful = false;

    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(codeToBytes);
        copySuccessful = true;
        console.log("Copied using modern clipboard API");
      }
    } catch (err) {
      console.log("Modern clipboard API failed, trying fallback:", err);
    }

    if (!copySuccessful) {
      try {
        // Fallback for older browsers or when modern API fails
        const textArea = document.createElement("textarea");
        textArea.value = codeToBytes;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand("copy");
        textArea.remove();

        if (successful) {
          copySuccessful = true;
          console.log("Copied using fallback method");
        }
      } catch (err) {
        console.error("Fallback copy method failed:", err);
      }
    }

    if (copySuccessful) {
      toast.success("Referral code copied!", {
        description: "Share this code with friends to earn rewards.",
      });
    } else {
      console.error("All copy methods failed");
      toast.error("Failed to copy referral code. Please copy manually.");
    }
  };

  const getAvatarColor = (address: string) => {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FECA57",
      "#FF9FF3",
      "#54A0FF",
      "#5F27CD",
      "#00D2D3",
      "#FF9F43",
    ];
    if (!address) return colors[0];
    const hash = address.slice(2, 8);
    const index = parseInt(hash, 16) % colors.length;
    return colors[index];
  };

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleUnlinkDiscord = async () => {
    try {
      await unlinkDiscord();
      toast.success("Discord unlinked successfully!");
    } catch (error) {
      toast.error("Failed to unlink Discord account");
      console.error("Unlink error:", error);
    }
  };

  const handleDiscordVerification = async () => {
    try {
      const authUrl = await getDiscordAuthUrl();
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
        }
      }, 1000);
    } catch (error) {
      console.error("Failed to start Discord verification:", error);
      toast.error("Failed to start Discord verification");
    }
  };

  const handleSubmitReferralCode = async () => {
    if (!referralCode.trim()) {
      toast.error("Please enter a referral code");
      return;
    }

    setIsSubmittingReferral(true);
    try {
      const response = await submitReferralCode(referralCode.trim());

      // Success - the API returned referral data
      if (response.usedReferralCode) {
        toast.success("Referral code submitted successfully!");
        setReferralCode("");
        setHasSubmittedReferral(true);

        // Invalidate and refetch user data to show updated referral info
        queryClient.invalidateQueries({ queryKey: queryKeys.referrals.user() });
        queryClient.invalidateQueries({ queryKey: queryKeys.stats.user() });
      } else {
        toast.error("Failed to apply referral code");
      }
    } catch (error: unknown) {
      console.error("Failed to submit referral code:", error);

      // Handle specific error messages from the API
      let errorMessage = "Failed to submit referral code. Please try again.";
      if (error && typeof error === "object" && "response" in error) {
        const errorResponse = error.response as {
          data?: { message?: string; error?: string };
        };
        errorMessage =
          errorResponse.data?.message ||
          errorResponse.data?.error ||
          errorMessage;
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmittingReferral(false);
    }
  };

  //todo : social achievement implementation. Bi eniig achievement bolgoj oruulhar holbono. Odoohondo coming soon bolgono social achievment hesgiig
  //todo: discord verified gdgiig haruulahda odoo zger l haruulj bga. Evteihneer verified ntr gsn yum haruulah heregtei bga. Ugaasa bugd metamask r orj irehdee discord holbotson orj ireh bolhor

  const socialAchievements = [
    {
      id: "discord_connect",
      title: "Discord ",
      description: "Connect your Discord account",
      icon: <Discord size={24} />,
      platform: "discord",
      xpReward: 50,
      completed: isDiscordVerified,
    },
    {
      id: "discord_join",
      title: "Join our Discord server",
      description: "Join the Gorillaz community Discord",
      icon: <Discord size={24} />,
      platform: "discord",
      xpReward: 25,
      completed: false, // This would need backend tracking
    },
    {
      id: "twitter_follow",
      title: "Follow on Twitter",
      description: "Follow @somegorillas on Twitter",
      icon: <Twitter size={24} />,
      platform: "twitter",
      xpReward: 25,
      completed: false,
    },
    {
      id: "twitter_retweet",
      title: "Retweet Announcement",
      description: "Retweet our latest announcement",
      icon: <Twitter size={24} />,
      platform: "twitter",
      xpReward: 25,
      completed: false,
    },
  ];

  const tabs = [{ id: "social", label: "Social", icon: <Globe size={20} /> }];

  if (!isClient || isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="max-w-[720px] mx-auto space-y-6 p-4">
        {/* Back Button */}
        <div className="flex justify-start">
          <GlareButton
            onClick={() => router.back()}
            background="rgba(255, 255, 255, 0.04)"
            borderRadius="12px"
            glareColor="#ffffff"
            borderColor="rgba(255, 255, 255, 0.04)"
            className="backdrop-blur-[40px] h-[44px] py-2 px-4 flex items-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 12H5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 19l-7-7 7-7"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-light-primary font-semibold text-button-48">
              Back
            </span>
          </GlareButton>
        </div>

        {/* <DiscordVerificationSection /> */}

        {/* Profile Header */}
        <div className="bg-translucent-dark-12 backdrop-blur-[40px] rounded-2xl border border-white/10 p-4 sm:p-6 mb-4">
          <div className="flex flex-col gap-4">
            {/* Avatar & Basic Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold flex-shrink-0"
                style={{ backgroundColor: getAvatarColor(user.walletAddress) }}
              >
                {user.walletAddress.slice(2, 4).toUpperCase()}
              </div>

              <div className="text-center sm:text-left flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  {formatAddress(user.walletAddress)}
                  <button
                    onClick={() => copyToClipboard(user.walletAddress)}
                    className="text-translucent-light-64 hover:text-white ml-2 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect
                        x="9"
                        y="9"
                        width="13"
                        height="13"
                        rx="2"
                        ry="2"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  </button>
                </h1>
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-2">
                  {/*<span className="text-gray-300 font-mono text-xs sm:text-sm">
                    {formatAddress(user.walletAddress)}
                  </span>*/}
                </div>
                {/* {globalStatsQuery.data && (
                  <div className="text-xs sm:text-sm text-translucent-light-64">
                    Rank #{globalStatsQuery.data.rank} of{" "}
                    {globalStatsQuery.data.totalUsers} players
                  </div>
                )} */}
              </div>
            </div>

            {/* Quick Stats */}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-translucent-dark-12 backdrop-blur-[40px] rounded-xl border border-white/10 p-1 mb-4">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 p-2 sm:p-3 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1 sm:gap-2 ${
                  activeTab === tab.id
                    ? "bg-white/20 text-white"
                    : "text-translucent-light-64 hover:text-white hover:bg-white/10"
                }`}
              >
                <span className="flex-shrink-0">{tab.icon}</span>
                <span className="hidden xs:inline sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}

        {activeTab === "social" && (
          <div className="bg-translucent-dark-12 backdrop-blur-[40px] rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Globe size={24} /> Social Integration
            </h2>
            <div className="grid gap-4">
              {socialAchievements.map((social) => (
                <div
                  key={social.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-translucent-dark-12 rounded-xl border border-white/10 gap-3 sm:gap-4"
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1">
                    <div className="text-xl sm:text-2xl flex-shrink-0">
                      {social.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-sm sm:text-base">
                        {social.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-translucent-light-64 break-words">
                        {social.description}
                      </p>
                      {/* <div className="text-xs text-purple-400 mt-1">
                        Reward: {social.xpReward} Bananas
                      </div> */}
                    </div>
                  </div>
                  <div className="flex-shrink-0 w-full sm:w-auto">
                    {social.completed ? (
                      <span className="text-green-400 font-medium flex items-center gap-1 text-xs sm:text-sm">
                        <CheckCircle size={14} /> Connected
                      </span>
                    ) : social.platform === "twitter" ? (
                      <CartoonButton
                        size={"sm"}
                        className="bg-translucent-light-24 w-full sm:w-auto text-xs sm:text-sm px-3 sm:px-4"
                        disabled={true}
                      >
                        Coming Soon
                      </CartoonButton>
                    ) : (
                      <CartoonButton
                        size={"sm"}
                        onClick={() => {
                          if (social.platform === "discord") {
                            if (social.id === "discord_join") {
                              window.open(
                                "https://discord.gg/3uGRW3kJd3",
                                "_blank",
                              );
                            } else if (social.id === "discord_connect") {
                              handleDiscordVerification();
                            }
                          }
                        }}
                        className="px-3 sm:px-4 bg-[#5865F2] py-2 text-indigo-100 w-full sm:w-auto text-xs sm:text-sm"
                        disabled={isDiscordLoading}
                      >
                        {social.id === "discord_join"
                          ? "Join"
                          : isDiscordLoading
                            ? "Connecting..."
                            : "Verify Discord"}
                      </CartoonButton>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Discord Status Details */}
            {isDiscordVerified && discordStatus?.discordUser && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Discord Status
                </h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 bg-translucent-dark-12 rounded-xl border border-white/10">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-600 flex-shrink-0">
                    {discordStatus.discordUser.avatar ? (
                      <img
                        src={`https://cdn.discordapp.com/avatars/${discordStatus.discordUser.id}/${discordStatus.discordUser.avatar}.png`}
                        alt="Discord Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className=" h-full flex items-center justify-center text-white font-bold">
                        {discordStatus.discordUser.username
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span className="text-white font-semibold text-sm sm:text-base break-all">
                        {discordStatus.discordUser.username}
                      </span>
                      <span className="text-green-400 flex items-center gap-1 text-xs sm:text-sm">
                        <CheckCircle size={14} /> Verified
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-translucent-light-64">
                      Connected on{" "}
                      {new Date(
                        discordStatus.discordUser.verifiedAt,
                      ).toLocaleDateString()}
                    </div>
                  </div>
                  {/*{process.env.NODE_ENV === "development" && (*/}
                  <CartoonButton
                    size={"sm"}
                    onClick={handleUnlinkDiscord}
                    className="px-3 sm:px-4 py-2 text-light-primary bg-system-error-primary text-xs sm:text-sm whitespace-nowrap"
                    disabled={isDiscordLoading}
                  >
                    {isDiscordLoading ? "Unlinking..." : "Unlink"}
                  </CartoonButton>
                  {/*)}*/}
                </div>
              </div>
            )}

            {/* Referral Code Input Section */}
            {!referralQuery.data?.usedReferralCode && !hasSubmittedReferral ? (
              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Enter Referral Code
                </h3>
                <div className="p-4 bg-translucent-dark-12 rounded-xl border border-white/10">
                  <p className="text-sm text-translucent-light-64 mb-4">
                    Have a referral code from a friend? Enter it here to claim
                    your bonus!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      onKeyPress={(e) => {
                        if (
                          e.key === "Enter" &&
                          referralCode.trim() &&
                          !isSubmittingReferral
                        ) {
                          handleSubmitReferralCode();
                        }
                      }}
                      placeholder="Enter referral code"
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-translucent-dark-24 border border-white/20 rounded-lg text-white text-sm sm:text-base placeholder-translucent-light-64 focus:outline-none focus:border-purple-400 transition-colors"
                      disabled={isSubmittingReferral}
                      maxLength={20}
                    />
                    <CartoonButton
                      onClick={handleSubmitReferralCode}
                      disabled={isSubmittingReferral || !referralCode.trim()}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-sm sm:text-base whitespace-nowrap"
                    >
                      {isSubmittingReferral ? "Submitting..." : "Submit"}
                    </CartoonButton>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Referral Status
                </h3>
                <div className="p-4 bg-translucent-dark-12 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle size={20} />
                    <span className="font-medium">
                      {hasSubmittedReferral
                        ? "Referral code submitted successfully!"
                        : "You were referred by someone!"}
                    </span>
                  </div>
                  <p className="text-sm text-translucent-light-64 mt-2">
                    You have successfully used a referral code and received your
                    bonus.
                  </p>
                </div>
              </div>
            )}

            {/* Share Your Referral Code Section */}
            {(referralQuery.data?.referralCode || referralQuery.data?.code) && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Share Your Referral Code
                </h3>
                <div className="p-4 bg-translucent-dark-12 rounded-xl border border-white/10">
                  <p className="text-sm text-translucent-light-64 mb-4">
                    Share your referral code with friends to earn rewards when
                    they join!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={
                        referralQuery.data?.referralCode ||
                        referralQuery.data?.code ||
                        ""
                      }
                      readOnly
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-translucent-dark-24 border border-white/20 rounded-lg text-white text-sm sm:text-base focus:outline-none cursor-default"
                    />
                    <CartoonButton
                      onClick={handleCopyReferralCode}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 hover:bg-green-700 text-sm sm:text-base whitespace-nowrap"
                    >
                      Copy Code
                    </CartoonButton>
                  </div>
                </div>
              </div>
            )}

            {/* Social Stats */}
          </div>
        )}

        {/* Action Buttons */}
      </div>
    </div>
  );
}
