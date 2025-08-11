"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Rank from "@/components/dashboard/rank";
import Achievements from "@/components/dashboard/achievements";
import Tasks from "@/components/dashboard/tasks";
import Activity from "@/components/dashboard/activity";
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
    <div className="w-full  flex flex-col overflow-hidden lg:overflow-visible">
      {isConnected && (
        <div className="w-full  px-4 sm:px-6 lg:px-8 py-2 flex-1 min-h-0 overflow-y-auto lg:overflow-visible">
          <div className="grid grid-cols-1 h-[928px] lg:grid-cols-12 gap-4  lg:h-auto">
            <div className="lg:col-span-4 space-y-3 lg:flex lg:flex-col lg:h-full">
              <Rank />
              <div className="lg:flex-1  lg:max-h-[756px]  lg:flex lg:flex-col lg:justify-end">
                <Achievements />
              </div>
            </div>
            <div className="lg:col-span-8 space-y-3 lg:flex lg:flex-col lg:h-full">
              <Tasks />
              <div className="lg:flex-1 lg:overflow-hidden lg:max-h-[356px] lg:min-h-0">
                <Activity />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
