import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import React from "react";
import { useLeaderboard, useGlobalStats } from "@/lib/query-helper";
import Head from "../icons/head";
import Banana from "../icons/banana";
import LeaderboardCard from "../cards/leaderboard-card";

interface RankModalProps {
  icon: React.ReactNode;
  isModalOpen: boolean;
  setIsModalOpen: () => void;
  statsLabel: string;
}

const RankModal: React.FC<RankModalProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const leaderboardQuery = useLeaderboard();
  const globalStatsQuery = useGlobalStats();

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent
        className="sm:max-w-2xl bg-translucent-dark-12 border-translucent-light-4 backdrop-blur-3xl rounded-3xl max-h-[80vh] overflow-hidden flex flex-col"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="text-h5 text-light-primary text-start leading-loose tracking-tight text-2xl font-semibold ">
            Leaderboard
          </DialogTitle>
          <DialogDescription className="text-light-primary/80 text-start">
            View global stats and player rankings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-y-auto ">
          {/* Global Stats Section */}
          <div className="flex w-full rounded-[12px] px-4 py-3 overflow-hidden border-2 bg-translucent-light-8 border-translucent-light-4">
            <div className="flex-1 text-start">
              <p className="text-translucent-light-64 text-start text-caption-1-medium font-pally mb-1">
                Total Bananas
              </p>
              {globalStatsQuery.isLoading ? (
                <div className="animate-pulse h-6 bg-translucent-light-16 rounded mx-auto w-16"></div>
              ) : (
                <div className="flex items-center gap-2">
                  <Banana size={24} />

                  <p className="text-light-primary text-body1-medium font-pally font-semibold">
                    {globalStatsQuery.data?.totalXpGiven?.toLocaleString() ||
                      "0"}
                  </p>
                </div>
              )}
            </div>
            <div className="w-0.5 bg-translucent-light-8 self-stretch mx-6"></div>
            <div className="flex-1 text-start">
              <p className="text-translucent-light-64 text-caption-1-medium font-pally mb-1">
                Total Users
              </p>
              {globalStatsQuery.isLoading ? (
                <div className="animate-pulse h-6 bg-translucent-light-16 rounded mx-auto w-12"></div>
              ) : (
                <div className="flex items-center gap-2">
                  <Head size={24} />
                  <p className="text-light-primary text-body1-medium font-pally font-semibold">
                    {globalStatsQuery.data?.totalUsers?.toLocaleString() || "0"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Global Leaderboard Section */}
          <div className="space-y-3">
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
              <div className="space-y-2 max-h-64 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {leaderboardQuery.data.map((user, index) => (
                  <LeaderboardCard
                    key={user.walletAddress}
                    user={user}
                    rank={index + 1} // This ensures 1-based ranking
                  />
                ))}
              </div>
            ) : (
              <div className="text-center p-4">
                <p className="text-translucent-light-64 text-body-2 font-pally">
                  Unable to load leaderboard
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RankModal;
