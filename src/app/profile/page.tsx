"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import GlareButton from "@/components/ui/glare-button";
import LoadingScreen from "@/components/screens/loading-screen";
import {
  useFlipHistory,
  useFlipRemaing,
  useReferral,
} from "@/lib/query-helper";
import { formatFlipSide, getGuessFromFlip } from "@/lib/utils";
import Target from "@/components/icons/target";
import Trophy from "@/components/icons/trophy";
import HeartBroken from "@/components/icons/heart-broken";
import Lightning from "@/components/icons/lightning";
import CheckCircle from "@/components/icons/check-circle";
import XCircle from "@/components/icons/x-circle";
import Globe from "@/components/icons/globe";
import Users from "@/components/icons/users";
import Twitter from "@/components/icons/twitter";
import Chart from "@/components/icons/chart";
import Coin from "@/components/icons/coin";
import Butt from "@/components/icons/butt";
import Head from "@/components/icons/head";
import AddFriend from "@/components/icons/add-friend";
import { toast } from "sonner";
import Discord from "@/components/icons/discord";

export default function Profile() {
  const {
    user,
    isAuthenticated,
    isLoading,
    discordStatus,
    isDiscordVerified,
    isDiscordLoading,
    unlinkDiscord,
  } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "social">("overview");

  const flipsHistoryQuery = useFlipHistory();
  const referralQuery = useReferral();
  const flipLimitQuery = useFlipRemaing();

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

  const handleCopyReferralLink = async () => {
    if (referralQuery.data?.referralCode) {
      const referralLink = `${window.location.origin}?ref=${referralQuery.data.referralCode}`;
      try {
        await navigator.clipboard.writeText(referralLink);
        setIsCopied(true);
        // Success feedback for copying referral link
        toast.success("Referral link copied!", {
          description: "Share this link with friends to earn rewards.",
        });

        setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
      } catch (err) {
        console.error("Failed to copy: ", err);
      }
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
    // Add toast notification here if you have one
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
      description: "Follow @SomeGorillas on Twitter",
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

  const tabs = [
    { id: "overview", label: "Overview", icon: <Chart size={20} /> },
    { id: "social", label: "Social", icon: <Globe size={20} /> },
  ];

  if (!isClient || isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated || !user) {
    return null;
  }
  const getWinRate = () => {
    if (flipsHistoryQuery.data && flipsHistoryQuery.data.length > 0) {
      const wins = flipsHistoryQuery.data.filter((flip) => flip.isWin).length;
      return ((wins / flipsHistoryQuery.data.length) * 100).toFixed(1);
    }
    return user.totalFlips > 0
      ? (((user.totalHeads + user.totalTails) / user.totalFlips) * 100).toFixed(
          1,
        )
      : "0";
  };

  const winRate = getWinRate();

  return (
    <div className="w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-2">
        {/* Back Button */}
        <div className="mb-4">
          <GlareButton
            onClick={() => router.back()}
            background="rgba(255, 255, 255, 0.16)"
            borderRadius="12px"
            borderColor="rgba(255, 255, 255, 0.04)"
            className="p-3 backdrop-blur-[40px] flex items-center gap-2 text-white"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none  ">
              <path
                d="M19 12H5M12 19l-7-7 7-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back
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
                  Profile
                </h1>
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-2">
                  <span className="text-gray-300 font-mono text-xs sm:text-sm">
                    {formatAddress(user.walletAddress)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(user.walletAddress)}
                    className="text-translucent-light-64 hover:text-white transition-colors"
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
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="text-center bg-translucent-light-4 pb-3 pt-4 rounded-2xl outline-1 outline-translucent-light-8">
                <div className="text-lg sm:text-2xl font-bold text-light-primary">
                  {user.xp.toLocaleString()}
                </div>
                <div className="text-xs text-translucent-light-64">Bananas</div>
              </div>

              <div className="text-center bg-translucent-light-4 pb-3 pt-4 rounded-2xl outline-1 outline-translucent-light-8">
                <div className="text-lg sm:text-2xl font-bold text-light-primary">
                  {winRate}%
                </div>
                <div className="text-xs text-translucent-light-64">
                  Win Rate
                </div>
              </div>
              <div className="text-center bg-translucent-light-4 pb-3 pt-4 rounded-2xl outline-1 outline-translucent-light-8">
                <div className="text-lg sm:text-2xl font-bold text-light-primary">
                  {user.totalFlips}
                </div>
                <div className="text-xs text-translucent-light-64">
                  Total Flips
                </div>
              </div>
            </div>
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
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* Stats Grid - FIXED: Added missing closing div and moved Daily Flips inside */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-2">
              <div className="bg-translucent-light-4 backdrop-blur-[40px] rounded-xl border border-white/10 p-3 sm:p-4 text-start ">
                <div className="text-xs sm:text-sm  text-translucent-light-64">
                  Total Flips
                </div>
                <div className="flex items-center gap-1">
                  <div className="text-xl sm:text-2xl  flex justify-center text-red-400">
                    <Target size={16} />
                  </div>
                  <div className="text-lg sm:text-2xl font-bold text-light-primary ">
                    {user.totalFlips}
                  </div>
                </div>
              </div>
              <div className="bg-translucent-light-4 backdrop-blur-[40px] rounded-xl border border-white/10 p-3 sm:p-4 text-start">
                <div className="text-xs sm:text-sm text-translucent-light-64">
                  Total Wins
                </div>
                <div className="flex items-center gap-1">
                  <div className="text-xl sm:text-2xl flex justify-center text-accent-primary">
                    <Trophy size={16} />
                  </div>
                  <div className="text-lg sm:text-2xl font-bold text-light-primary">
                    {flipsHistoryQuery.data
                      ? flipsHistoryQuery.data.filter((flip) => flip.isWin)
                          .length
                      : user.totalHeads + user.totalTails}
                  </div>
                </div>
              </div>
              <div className="bg-translucent-light-4 backdrop-blur-[40px] rounded-xl border border-white/10 p-3 sm:p-4 text-start">
                <div className="text-xs sm:text-sm text-translucent-light-64">
                  Total Losses
                </div>
                <div className="flex items-center gap-1">
                  <div className="text-xl sm:text-2xl flex justify-center text-red-500">
                    <HeartBroken size={16} />
                  </div>
                  <div className="text-lg sm:text-2xl font-bold text-light-primary">
                    {flipsHistoryQuery.data
                      ? flipsHistoryQuery.data.filter((flip) => !flip.isWin)
                          .length
                      : Math.max(
                          0,
                          user.totalFlips - (user.totalHeads + user.totalTails),
                        )}
                  </div>
                </div>
              </div>
              <div className="bg-translucent-light-4 backdrop-blur-[40px] rounded-xl border border-white/10 p-3 sm:p-4 text-start">
                <div className="text-xs sm:text-sm text-translucent-light-64">
                  Heads Won
                </div>
                <div className="flex items-center gap-1">
                  <div className="text-xl sm:text-2xl flex justify-center text-light-primary">
                    <Head size={16} />
                  </div>
                  <div className="text-lg sm:text-2xl font-bold text-light-primary">
                    {user.totalHeads}
                  </div>
                </div>
              </div>
              <div className="bg-translucent-light-4 backdrop-blur-[40px] rounded-xl border border-white/10 p-3 sm:p-4 text-start">
                <div className="text-xs sm:text-sm text-translucent-light-64">
                  Butt Won
                </div>
                <div className="flex items-center gap-1">
                  <div className="text-xl sm:text-2xl flex justify-center text-light-primary">
                    <Butt size={16} />
                  </div>
                  <div className="text-lg sm:text-2xl font-bold text-light-primary">
                    {user.totalTails}
                  </div>
                </div>
              </div>
              {/* FIXED: Moved Daily Flips card inside the grid */}
              <div className="bg-translucent-light-4 backdrop-blur-[40px] rounded-xl border border-white/10 p-3 sm:p-4 text-start">
                <div className="text-xs sm:text-sm text-translucent-light-64">
                  Daily Flips
                </div>
                <div className="flex items-center gap-1">
                  <div className="text-xl sm:text-2xl flex justify-center text-accent-primary">
                    <Lightning size={16} />
                  </div>
                  <div className="text-lg sm:text-2xl font-bold text-light-primary">
                    {flipLimitQuery.data
                      ? `${flipLimitQuery.data.count}/${flipLimitQuery.data.maxFlip}`
                      : "0/10"}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity & Referral */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recent Flips */}
              <div className="bg-translucent-dark-12 backdrop-blur-[40px] rounded-2xl border border-white/10 p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Coin size={20} /> Recent Flips
                </h3>
                {flipsHistoryQuery.data && flipsHistoryQuery.data.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {flipsHistoryQuery.data.slice(0, 10).map((flip) => {
                      const userGuess = getGuessFromFlip(flip);
                      return (
                        <div
                          key={flip.id}
                          className="flex justify-between items-center p-2 bg-translucent-dark-12 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-medium flex items-center gap-1 ${flip.isWin ? "text-green-400" : "text-red-400"}`}
                            >
                              {flip.isWin ? (
                                <>
                                  <CheckCircle size={16} /> WIN
                                </>
                              ) : (
                                <>
                                  <XCircle size={16} /> LOSS
                                </>
                              )}
                            </span>
                            <span className="text-gray-300 text-sm">
                              {formatFlipSide(userGuess)} →{" "}
                              {formatFlipSide(flip.result)}
                            </span>
                          </div>
                          <span className="text-xs text-translucent-light-64">
                            {new Date(flip.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-translucent-light-64 text-center py-4">
                    No flips yet
                  </p>
                )}
              </div>

              {/* Referral System */}
              <div className="bg-translucent-dark-12 backdrop-blur-[40px] rounded-2xl border border-white/10 p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Users size={20} /> Referral System
                </h3>
                {referralQuery.data && (
                  <div className="flex flex-col gap-4">
                    <div className="space-y-3">
                      {/* Horizontal Referral Card */}
                      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-translucent-light-8 border-2 border-translucent-light-4 rounded-2xl">
                        {/* Add Friend Icon in Square Container */}
                        <div className="flex-shrink-0 bg-translucent-light-12 border-translucent-light-4 border-2 p-2 rounded-[12px] w-16 h-16 flex items-center justify-center">
                          <AddFriend size={48} />
                        </div>

                        {/* Middle Text */}
                        <div className="flex-1 text-center sm:text-start">
                          <p className="text-light-primary text-body1 font-semibold">
                            Get 50 bananas for free
                          </p>
                          <p className="text-translucent-light-64 text-body2-medium font-pally">
                            Invite your friend and get 50 bananas
                          </p>
                        </div>

                        {/* Copy Button */}
                        <GlareButton
                          onClick={handleCopyReferralLink}
                          background={isCopied ? "#22C55E" : "#EAB308"}
                          borderRadius="12px"
                          borderColor="transparent"
                          glareColor="#ffffff"
                          glareOpacity={0.3}
                          className="text-white py-3 px-4 sm:px-6 text-body-2-semibold font-pally font-semibold w-full sm:w-auto"
                          disabled={isCopied}
                        >
                          {isCopied ? "Copied!" : "Copy Link"}
                        </GlareButton>
                      </div>
                    </div>
                    <div className="text-sm text-translucent-light-64 flex gap-2">
                      Referred Users:{" "}
                      <span className="text-white font-medium">
                        {referralQuery.data.referredUsers.length}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "social" && (
          <div className="bg-translucent-dark-12 backdrop-blur-[40px] rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Globe size={24} /> Social Integration
            </h2>
            <div className="grid gap-4">
              {socialAchievements.map((social) => (
                <div
                  key={social.id}
                  className="flex items-center justify-between p-4 bg-translucent-dark-12 rounded-xl border border-white/10"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{social.icon}</div>
                    <div>
                      <h3 className="font-semibold text-white">
                        {social.title}
                      </h3>
                      <p className="text-sm text-translucent-light-64">
                        {social.description}
                      </p>
                      {/* <div className="text-xs text-purple-400 mt-1">
                        Reward: {social.xpReward} Bananas
                      </div> */}
                    </div>
                  </div>
                  <div>
                    {social.completed ? (
                      <span className="text-green-400 font-medium flex items-center gap-1">
                        <CheckCircle size={16} /> Connected
                      </span>
                    ) : social.platform === "twitter" ? (
                      <span className="text-gray-400 font-medium px-4 py-2 rounded-lg bg-translucent-dark-8 border border-translucent-light-8">
                        Coming Soon
                      </span>
                    ) : (
                      <GlareButton
                        onClick={() => {
                          if (social.platform === "discord") {
                            if (social.id === "discord_join") {
                              window.open(
                                "https://discord.gg/3uGRW3kJd3",
                                "_blank",
                              );
                            } else if (social.id === "discord_connect") {
                              // Handle Discord account connection
                              window.open(
                                "https://discord.gg/3uGRW3kJd3",
                                "_blank",
                              );
                            }
                          }
                        }}
                        background="rgba(88, 101, 242, 0.9)"
                        borderRadius="8px"
                        borderColor="rgba(88, 101, 242, 0.3)"
                        className="px-4 py-2 text-indigo-100"
                      >
                        {social.id === "discord_join" ? "Join" : "Connect"}
                      </GlareButton>
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
                <div className="flex items-center gap-4 p-4 bg-translucent-dark-12 rounded-xl border border-white/10">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-600 flex-shrink-0">
                    {discordStatus.discordUser.avatar ? (
                      <img
                        src={`https://cdn.discordapp.com/avatars/${discordStatus.discordUser.id}/${discordStatus.discordUser.avatar}.png`}
                        alt="Discord Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold">
                        {discordStatus.discordUser.username
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">
                        {discordStatus.discordUser.username}
                      </span>
                      <span className="text-green-400 flex items-center gap-1 text-sm">
                        <CheckCircle size={16} /> Verified
                      </span>
                    </div>
                    <div className="text-sm text-translucent-light-64">
                      Connected on{" "}
                      {new Date(
                        discordStatus.discordUser.verifiedAt,
                      ).toLocaleDateString()}
                    </div>
                  </div>
                  {process.env.NODE_ENV === "development" && (
                    <GlareButton
                      onClick={handleUnlinkDiscord}
                      background="rgba(239, 68, 68, 0.9)"
                      borderRadius="8px"
                      borderColor="rgba(239, 68, 68, 0.3)"
                      className="px-4 py-2 text-light-primary hover:bg-red-500 transition-colors"
                      disabled={isDiscordLoading}
                    >
                      {isDiscordLoading ? "Unlinking..." : "Unlink"}
                    </GlareButton>
                  )}
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
