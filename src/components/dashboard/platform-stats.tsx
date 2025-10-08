"use client";

import React from "react";
import GlobalStatCard from "@/components/cards/global-stat-card";
import PieChart from "../icons/pie-chart";
import Switch from "../icons/switch";
import Stats from "../icons/stats";
import {
  usePlatformTransactions,
  usePlatformVolume,
  usePlatformRandomness,
  usePlatformMinesExploded,
  usePlatformPoolSize,
} from "@/lib/query-helper";
import Coins from "../icons/coins";
import Sad from "../icons/sad";

const PlatformStats = () => {
  const {
    data: transactions,
    isLoading: transactionsLoading,
    error: transactionsError,
  } = usePlatformTransactions();
  const {
    data: volume,
    isLoading: volumeLoading,
    error: volumeError,
  } = usePlatformVolume();
  const {
    data: randomness,
    isLoading: randomnessLoading,
    error: randomnessError,
  } = usePlatformRandomness();
  const {
    data: minesExploded,
    isLoading: minesLoading,
    error: minesError,
  } = usePlatformMinesExploded();
  const {
    data: poolSize,
    isLoading: poolSizeLoading,
    error: poolSizeError,
  } = usePlatformPoolSize();

  // Debug logging
  console.log("Platform Stats Debug:", {
    transactions,
    volume,
    randomness,
    minesExploded,
    poolSize,
    errors: {
      transactionsError,
      volumeError,
      randomnessError,
      minesError,
      poolSizeError,
    },
  });

  const formatVolume = (ethValue?: string) => {
    if (!ethValue) return "0";
    const num = parseFloat(ethValue);
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toFixed(2);
  };

  const isLoading =
    transactionsLoading ||
    volumeLoading ||
    randomnessLoading ||
    minesLoading ||
    poolSizeLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex gap-5 p-4 bg-translucent-light-4 rounded-2xl backdrop-blur-xl border-2 border-translucent-light-4 animate-pulse"
          >
            <div className="flex rounded-[12px] justify-center border-2 border-translucent-light-4 bg-translucent-light-8 items-center p-4 w-[56px] h-[56px]" />
            <div className="flex flex-col gap-1">
              <div className="h-4 bg-translucent-light-8 rounded w-24" />
              <div className="h-6 bg-translucent-light-8 rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <GlobalStatCard
        icon={<Switch size={24} />}
        title="Total Transactions"
        value={transactions?.totalTransactions ?? "Loading..."}
      />
      <GlobalStatCard
        icon={<PieChart size={24} />}
        title="Pool Size"
        value={
          poolSize?.poolSize ? formatVolume(poolSize.poolSize) : "Loading..."
        }
      />
      <GlobalStatCard
        icon={<Stats size={24} />}
        title="Total Volume(SOMI)"
        value={
          volume?.totalVolume ? formatVolume(volume.totalVolume) : "Loading..."
        }
      />
      <GlobalStatCard
        icon={<Coins size={24} />}
        title="Flipped on Heads"
        value={randomness?.actualOutcomes?.wins ?? "Loading..."}
      />
      <GlobalStatCard
        icon={<Coins size={24} />}
        title="Flipped on Butts"
        value={randomness?.actualOutcomes?.losses ?? "Loading..."}
      />
      <GlobalStatCard
        icon={<Sad size={24} />}
        title="Mines Exploded"
        value={minesExploded?.totalMinesExploded ?? "Loading..."}
      />
    </div>
  );
};

export default PlatformStats;
