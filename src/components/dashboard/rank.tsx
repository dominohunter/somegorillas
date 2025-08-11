"use client";

import { useStats, useGlobalStats } from "@/lib/query-helper";
import StatsCard from "../cards/stats-card";
import Chart from "../icons/chart";
import Banana from "../icons/banana";

export default function Rank() {
  const statsQuery = useStats();
  const globalStatsQuery = useGlobalStats();

  // if (statsQuery.isLoading || globalStatsQuery.isLoading) {
  //   return (
  //     <div className="p-4 gap-3 flex flex-col rounded-3xl border-2 border-translucent-light-4 bg-translucent-dark-12 backdrop-blur-[60px]">
  //       {/* First StatsCard Skeleton */}
  //       <div className="flex p-4 gap-5 items-center rounded-2xl border-2 border-translucent-light-4 bg-translucent-light-12">
  //         {/* Icon skeleton */}
  //         <div className="p-2 flex items-center bg-translucent-light-12 border-2 border-translucent-light-4 rounded-[8px]">
  //           <div className="w-12 h-12 bg-translucent-light-16 rounded"></div>
  //         </div>
  //         {/* Content skeleton */}
  //         <div className="flex w-full justify-between">
  //           <div className="space-y-2">
  //             <div className="h-4 bg-translucent-light-16 rounded w-16"></div>
  //             <div className="h-6 bg-translucent-light-16 rounded w-12"></div>
  //           </div>
  //         </div>
  //       </div>

  //       {/* Second StatsCard Skeleton */}
  //       <div className="flex p-4 gap-5 items-center rounded-2xl border-2 border-translucent-light-4 bg-translucent-light-12">
  //         {/* Icon skeleton */}
  //         <div className="p-2 flex items-center bg-translucent-light-12 border-2 border-translucent-light-4 rounded-[8px]">
  //           <div className="w-12 h-12 bg-translucent-light-16 rounded"></div>
  //         </div>
  //         {/* Content skeleton */}
  //         <div className="flex w-full justify-between">
  //           <div className="space-y-2">
  //             <div className="h-4 bg-translucent-light-16 rounded w-14"></div>
  //             <div className="h-6 bg-translucent-light-16 rounded w-8"></div>
  //           </div>
  //           {/* Button skeleton */}
  //           <div className="flex items-center justify-center">
  //             <div className="w-12 h-12 bg-translucent-light-16 rounded-[12px]"></div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="p-4 gap-3 flex flex-col rounded-3xl border-2 border-translucent-light-4 bg-translucent-dark-12 backdrop-blur-[60px]">
      {statsQuery.data && globalStatsQuery.data && (
        <>
          <StatsCard
            icon={<Banana size={48} />}
            statsLabel="Bananas"
            stats={statsQuery.data.xp}
          />
          <StatsCard
            icon={<Chart size={48} />}
            statsLabel="My Rank"
            stats={globalStatsQuery.data.rank}
            clickAble={true}
          />
        </>
      )}
    </div>
  );
}
