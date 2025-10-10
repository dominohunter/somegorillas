"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Achievements from "@/components/dashboard/achievements";
import Tasks from "@/components/dashboard/tasks";
import PlatformStats from "@/components/dashboard/platform-stats";
import LoadingScreen from "@/components/screens/loading-screen";
import { ScrollArea } from "@/components/ui/scroll-area";
import LeaderboardCard from "@/components/cards/leaderboard-card";
import { useLeaderboard, useGlobalStats } from "@/lib/query-helper";
import Banana from "@/components/icons/banana";
import Head from "@/components/icons/head";
import { getAvatarColor } from "@/components/sections/header";
import { useAuth } from "@/contexts/auth-context";
import Image from "next/image";

export default function Dashboard() {
  const { isConnected } = useAccount();
  const [isClient, setIsClient] = useState(false);
  const leaderboardQuery = useLeaderboard();
  const globalStatsQuery = useGlobalStats();
  const { user, address } = useAuth();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const currentUserIndex =
    leaderboardQuery.data?.findIndex(
      (u) => u.walletAddress.toLowerCase() === address?.toLowerCase()
    ) ?? -1;
  const currentUserRank = currentUserIndex >= 0 ? currentUserIndex + 1 : -1;
  const isUserInTop25 = currentUserRank > 0 && currentUserRank <= 25;
  const top25Users = leaderboardQuery.data?.slice(0, 25) || [];
  const currentUser =
    currentUserIndex >= 0 ? leaderboardQuery.data?.[currentUserIndex] : null;

  return (
    <div className="w-full min-h-screen flex flex-col overflow-hidden">
      {isConnected && (
        <div className="w-full px-3 sm:px-5 lg:px-8 grid gap-4 flex-1 min-h-0 overflow-y-auto">
          {/* --- Main layout --- */}
          <div className="flex flex-col xl:flex-row gap-4 pb-6 w-full">
            {/* Left side */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">
              <PlatformStats />

              {/* Tasks + Achievements */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 w-full md:w-1/2">
                  <Tasks />
                </div>
                <div className="flex-1 w-full md:w-1/2">
                  <Achievements />
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="w-full xl:w-[420px] 2xl:w-[460px] lg:h-[956px] flex-shrink-0 bg-translucent-light-4 backdrop-blur-2xl rounded-2xl p-4 grid gap-3">
              {/* Header */}
              <div className="px-4 py-3 flex items-center border-2 border-translucent-light-4 rounded-[12px] bg-translucent-light-8 text-h6 md:text-h5 text-light-primary font-semibold text-center sm:text-left">
                Leaderboard
              </div>

              {/* My Rank */}
              <div className="p-4 border-2 border-translucent-light-4 flex items-center bg-translucent-light-4 rounded-[12px]">
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4">
                  <div
                    // style={{
                    //   backgroundColor: getAvatarColor(
                    //     user?.walletAddress || ""
                    //   ),
                    // }}
                    className="p-3 border-2 bg-translucent-light-4 border-translucent-light-4 h-[52px] w-[52px] flex items-center justify-center rounded-[8px]"
                  >
                    <Image
                      src="/chart.svg"
                      alt="rank chart image"
                      height={28}
                      width={28}
                      className="object-cover h-7 w-7"
                    />
                  </div>
                  <div className="grid gap-1">
                    <h1 className="text-caption-1-medium font-medium text-translucent-light-80">
                      My rank
                    </h1>
                    <p className="text-body-1-medium font-medium text-light-primary">
                      {currentUserRank > 0
                        ? currentUserRank.toLocaleString()
                        : "Unranked"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Leaderboard list */}
              <ScrollArea className="h-[380px] sm:h-[480px] md:h-[560px] lg:h-[600px] xl:h-[600px] grid gap-2">
                {leaderboardQuery.isLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="animate-pulse flex justify-between items-center p-3 rounded-xl bg-translucent-light-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-translucent-light-16 rounded"></div>
                          <div className="w-24 h-4 bg-translucent-light-16 rounded"></div>
                        </div>
                        <div className="w-16 h-4 bg-translucent-light-16 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : leaderboardQuery.data ? (
                  <div className="space-y-2">
                    {top25Users.map((user, index) => (
                      <LeaderboardCard
                        key={user.walletAddress}
                        user={user}
                        rank={index + 1}
                        isCurrentUser={
                          user.walletAddress.toLowerCase() ===
                          address?.toLowerCase()
                        }
                      />
                    ))}

                    {!isUserInTop25 && currentUser && currentUserRank > 0 && (
                      <>
                        <div className="flex items-center justify-center py-2">
                          <span className="text-translucent-light-64 text-caption-1 font-pally">
                            ⋯
                          </span>
                        </div>
                        <LeaderboardCard
                          key={`current-user-${currentUser.walletAddress}`}
                          user={currentUser}
                          rank={currentUserRank}
                          isCurrentUser={true}
                        />
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <p className="text-translucent-light-64 text-body-2 font-pally">
                      Unable to load leaderboard
                    </p>
                  </div>
                )}
              </ScrollArea>

              {/* Global Stats */}
              <div className="border-2 border-translucent-light-4 bg-translucent-light-4 p-4 rounded-[12px]">
                <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-6">
                  <div className="grid gap-1 flex-1">
                    <h1 className="text-caption-1-medium font-medium text-translucent-light-80">
                      Total bananas
                    </h1>
                    {globalStatsQuery.isLoading ? (
                      <div className="animate-pulse h-6 bg-translucent-light-16 rounded mx-auto w-16"></div>
                    ) : (
                      <p className="text-body-1-medium font-medium text-light-primary flex items-center gap-2">
                        <Banana size={24} />
                        <span>
                          {globalStatsQuery.data?.totalXpGiven?.toLocaleString() ||
                            "0"}
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="hidden sm:block w-[1px] h-[52px] bg-translucent-light-4" />

                  <div className="grid gap-1 flex-1">
                    <h1 className="text-caption-1-medium font-medium text-translucent-light-80">
                      Total users
                    </h1>
                    {globalStatsQuery.isLoading ? (
                      <div className="animate-pulse h-6 bg-translucent-light-16 rounded mx-auto w-12"></div>
                    ) : (
                      <p className="text-body-1-medium font-medium text-light-primary flex items-center gap-2">
                        <Head size={24} />
                        <span>
                          {globalStatsQuery.data?.totalUsers?.toLocaleString() ||
                            "0"}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
