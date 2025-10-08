"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
// import Rank from "@/components/dashboard/rank";
import Achievements from "@/components/dashboard/achievements";
import Tasks from "@/components/dashboard/tasks";
// import Activity from "@/components/dashboard/activity";
import PlatformStats from "@/components/dashboard/platform-stats";
import LoadingScreen from "@/components/screens/loading-screen";

export default function Dashboard() {
  const { isConnected } = useAccount();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <LoadingScreen />;
  }

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden">
      {isConnected && (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-2 flex-1 min-h-0 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
            {/* Global Stats Section */}
            <div className="lg:col-span-12 mb-4">{/*<GlobalStats />*/}</div>

            {/* Platform Stats Section */}

            {/* Main Dashboard Grid */}
            <div className="lg:col-span-4 space-y-3 lg:flex lg:flex-col lg:h-full">
              <div className="lg:flex-1 lg:flex lg:flex-col overflow-scroll">
                <Achievements />
              </div>
            </div>
            <div className="lg:col-span-8 space-y-3 lg:flex lg:flex-col lg:h-full">
              <PlatformStats />
              <div className="lg:flex-1 lg:min-h-0">
                <Tasks />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
