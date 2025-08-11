"use client";

import { useGlobalFlipHistory } from "@/lib/query-helper";
import { formatFlipSide } from "@/lib/utils";

export default function Activity() {
  const globalFlipsQuery = useGlobalFlipHistory();

  // if (globalFlipsQuery.isLoading) {
  //   return (
  //     <div className="p-4 bg-translucent-dark-12 border-2 backdrop-blur-[60px] flex flex-col gap-3 rounded-3xl border-translucent-light-4">
  //       <div className="">
  //         {/* Header skeleton */}
  //         <div className="h-6 bg-translucent-light-16 rounded w-32 mb-3"></div>

  //         {/* Activity items skeleton */}
  //         <div className="space-y-3 max-h-[700px] overflow-y-auto">
  //           {[...Array(8)].map((_, i) => (
  //             <div
  //               key={i}
  //               className="flex items-center justify-between p-3 bg-translucent-light-8 border border-translucent-light-4 rounded-lg"
  //             >
  //               <div className="flex items-center space-x-2">
  //                 <div className="h-4 bg-translucent-light-16 rounded w-16"></div>
  //                 <div className="h-4 bg-translucent-light-16 rounded w-12"></div>
  //                 <div className="h-4 bg-translucent-light-16 rounded w-10"></div>
  //               </div>
  //               <div className="h-3 bg-translucent-light-16 rounded w-12"></div>
  //             </div>
  //           ))}
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  const formatWalletAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 4)}...${address.slice(-2)}`;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return `${diffSecs}s ago`;
  };
  const getWinIndicator = (isWin: boolean) => {
    if (isWin) {
      return (
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-caption-1-medium font-pally text-green-500 font-semibold">
            WIN
          </span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span className="text-caption-1-medium font-pally text-red-500 font-semibold">
            LOSS
          </span>
        </div>
      );
    }
  };

  return (
    <div className=" p-4 bg-translucent-dark-12 h-full border-2 backdrop-blur-[60px] flex flex-col gap-3 overflow-hidden rounded-3xl border-translucent-light-4">
      <div className="flex flex-col space-y-3 max-h-[600px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {globalFlipsQuery.data && globalFlipsQuery.data.length > 0 ? (
          globalFlipsQuery.data.map((flip) => (
            <div
              key={flip.id}
              className="flex items-center justify-between p-3 bg-translucent-light-8 border border-translucent-light-4 rounded-lg"
            >
              <div className="flex flex-col space-y-1 min-w-0 flex-1">
                <span className="text-body-2-medium font-pally text-light-primary font-semibold truncate">
                  {formatWalletAddress(flip.userAddress)}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-body2-medium font-pally text-translucent-light-64">
                    flipped a
                  </span>
                  <span className="text-body2-medium font-pally text-light-primary font-semibold">
                    {formatFlipSide(flip.result.toLowerCase())}
                  </span>
                  {getWinIndicator(flip.isWin)}
                </div>
              </div>
              <span className="text-caption-1-medium font-pally text-translucent-light-64 ml-2 flex-shrink-0">
                {formatTimeAgo(flip.createdAt)}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <span className="text-body-2-medium font-pally text-translucent-light-64">
              No recent activity
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
