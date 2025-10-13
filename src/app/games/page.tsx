"use client";
import { Button } from "@/components/ui/button";
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import LeaderboardCard from "@/components/cards/leaderboard-card";
import { useLeaderboard, useGlobalStats } from "@/lib/query-helper";
import Banana from "@/components/icons/banana";
import Head from "@/components/icons/head";
import { CartoonButton } from "@/components/ui/cartoon-button";
import { useRouter } from "next/navigation";
import { getAvatarColor } from "@/components/sections/header";
import { useAuth } from "@/contexts/auth-context";

export default function Games() {
  const leaderboardQuery = useLeaderboard();
  const globalStatsQuery = useGlobalStats();
  const router = useRouter();
  const { user, address } = useAuth();

  // Find current user's position and prepare display data
  const currentUserIndex =
    leaderboardQuery.data?.findIndex(
      (user) => user.walletAddress.toLowerCase() === address?.toLowerCase(),
    ) ?? -1;
  const currentUserRank = currentUserIndex >= 0 ? currentUserIndex + 1 : -1;
  const isUserInTop25 = currentUserRank > 0 && currentUserRank <= 25;

  // Get top 25 users for display
  const top25Users = leaderboardQuery.data?.slice(0, 25) || [];
  const currentUser =
    currentUserIndex >= 0 ? leaderboardQuery.data?.[currentUserIndex] : null;
  return (
    <section className="w-full flex flex-col lg:flex-row items-start lg:items-center h-auto overflow-y-hidden gap-4 px-4 lg:px-6">
      {/* LEFT SIDE - GAME CARDS */}
      <div className="grid w-full lg:w-[70%] h-auto gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className="relative h-[300px] md:h-[436px] w-full rounded-xl overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-102"
            style={{
              backgroundImage: "url('/1.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="absolute inset-0 gradient-dark-vertical"></div>
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-end h-full p-4 md:pl-6 md:pr-4 md:py-4 z-10">
              <h1 className="text-h6 md:text-h5 font-semibold flex items-center text-light-primary mb-2 md:mb-0">
                Coin Flip
              </h1>
              <CartoonButton
                variant="secondary"
                className="text-button-48 font-semibold text-dark-primary w-[118px] h-12 cursor-pointer"
                onClick={() => router.push("/dashboard/flip")}
              >
                Play now!
              </CartoonButton>
            </div>
          </div>
          <div
            className="relative h-[300px] md:h-[436px] w-full rounded-xl overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-102"
            style={{
              backgroundImage: "url('/2.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="absolute inset-0 gradient-dark-vertical"></div>
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-end h-full p-4 md:pl-6 md:pr-4 md:py-4 z-10">
              <h1 className="text-h6 md:text-h5 font-semibold flex items-center text-light-primary mb-2 md:mb-0">
                Mines
              </h1>
              <CartoonButton
                variant="secondary"
                className="text-button-48 font-semibold text-dark-primary w-[118px] h-12 cursor-pointer"
                onClick={() => router.push("/dashboard/mines")}
              >
                Play now!
              </CartoonButton>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            className="relative h-[300px] md:h-[436px] w-auto rounded-xl overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-102"
            style={{
              backgroundImage: "url('/3.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="absolute inset-0 gradient-dark-vertical"></div>
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-end h-full p-4 md:pl-6 md:pr-4 md:py-4 z-10">
              <h1 className="text-h6 md:text-h5 font-semibold flex items-center text-light-primary mb-2 md:mb-0">
                Flinko
              </h1>
              <Button
                variant="secondary"
                className="text-button-40 font-semibold bg-translucent-light-4 border-2 border-translucent-light-4 px-4 py-3 backdrop-blur-xl text-light-primary w-[127px] h-10 cursor-pointer hover:bg-transparent"
              >
                Coming soon
              </Button>
            </div>
          </div>
          <div
            className="relative h-[300px] md:h-[436px] w-auto rounded-xl overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-102"
            style={{
              backgroundImage: "url('/4.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="absolute inset-0 gradient-dark-vertical"></div>
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-end h-full p-4 md:pl-6 md:pr-4 md:py-4 z-10">
              <h1 className="text-h6 md:text-h5 font-semibold flex items-center text-light-primary mb-2 md:mb-0">
                Rock, Paper, Scissors
              </h1>
              <Button
                variant="secondary"
                className="text-button-40 font-semibold bg-translucent-light-4 border-2 border-translucent-light-4 px-4 py-3 backdrop-blur-xl text-light-primary w-[127px] h-10 cursor-pointer hover:bg-transparent"
              >
                Coming soon
              </Button>
            </div>
          </div>
          <div
            className="relative h-[300px] md:h-[436px] w-full rounded-xl overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-102"
            style={{
              backgroundImage: "url('/5.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="absolute inset-0 gradient-dark-vertical"></div>
            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-end h-full p-4 md:pl-6 md:pr-4 md:py-4 z-10">
              <h1 className="text-h6 md:text-h5 font-semibold flex items-center text-light-primary mb-2 md:mb-0">
                Limbo
              </h1>
              <Button
                variant="secondary"
                className="text-button-40 font-semibold bg-translucent-light-4 border-2 border-translucent-light-4 px-4 py-3 backdrop-blur-xl text-light-primary w-[127px] h-10 cursor-pointer hover:bg-transparent"
              >
                Coming soon
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - LEADERBOARD */}
      <div className="w-full lg:w-[453.33px] h-auto p-3 grid gap-3 bg-translucent-light-4 rounded-2xl">
        <div className="px-5 py-4 border-2 border-translucent-light-4 grid gap-[10px] rounded-[12px] bg-translucent-light-8 text-h6 md:text-h5 h-16 w-full text-light-primary font-semibold">
          Leaderboard
        </div>
        {/* My Rank Section */}
        <div className="p-4 border-2 border-translucent-light-4 bg-translucent-light-4 min-h-[84px] flex flex-col md:flex-row gap-4 md:gap-6 rounded-[12px]">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 w-full">
            <div className="flex gap-4 flex-1 md:w-[174.67px]">
              <div
                style={{
                  backgroundColor: getAvatarColor(user?.walletAddress || ""),
                }}
                className="p-3 border-2 border-translucent-light-4 h-[52px] w-[52px] items-center justify-center rounded-[8px]"
              ></div>
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
            <div className="hidden md:block w-[2px] h-[52px] bg-translucent-light-4" />
            {/*<div className="grid gap-1 flex-1">
              <h1 className="text-caption-1-medium font-medium text-translucent-light-80">
                Highest rank
              </h1>
              <p className="text-body-1-medium font-medium text-light-primary">
                1,202
              </p>
            </div>*/}
          </div>
        </div>

        {/* Leaderboard List */}
        <ScrollArea className="h-[400px] md:h-[600px] w-auto grid gap-2">
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
                    user.walletAddress.toLowerCase() === address?.toLowerCase()
                  }
                />
              ))}

              {/* Show current user's position if they're outside top 25 */}
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
        <div className="border-2 border-translucent-light-4 bg-translucent-light-4 p-4 grid gap-6 rounded-[12px]">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="grid gap-1 flex-1 md:w-[174.67px]">
              <h1 className="text-caption-1-medium font-medium text-translucent-light-80">
                Total bananas
              </h1>
              {globalStatsQuery.isLoading ? (
                <div className="animate-pulse h-6 bg-translucent-light-16 rounded mx-auto w-16"></div>
              ) : (
                <p className="text-body-1-medium font-medium text-light-primary flex gap-2">
                  <Banana size={24} />
                  <span>
                    {globalStatsQuery.data?.totalXpGiven?.toLocaleString() ||
                      "0"}
                  </span>
                </p>
              )}
            </div>
            <div className="hidden md:block w-[1px] h-[52px] bg-translucent-light-4" />
            <div className="grid gap-1 flex-1 md:w-[174.67px]">
              <h1 className="text-caption-1-medium font-medium text-translucent-light-80">
                Total users
              </h1>
              {globalStatsQuery.isLoading ? (
                <div className="animate-pulse h-6 bg-translucent-light-16 rounded mx-auto w-12"></div>
              ) : (
                <p className="text-body-1-medium font-medium text-light-primary flex gap-2">
                  <Head size={24} />
                  <span>
                    {globalStatsQuery.data?.totalUsers?.toLocaleString() || "0"}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
