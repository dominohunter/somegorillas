"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";

interface GameCardProps {
  name: string;
  image?: string;
  description: string;
  onPress?: () => void;
  isComingSoon?: boolean;
}

const GameCard: React.FC<GameCardProps> = ({
  name,
  image,
  description,
  onPress,
  isComingSoon,
}) => {
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  return (
    <div className="bg-translucent-dark-8 backdrop-blur-2xl flex p-8 rounded-lg shadow-md gap-8">
      <div className="p-10 bg-translucent-light-4 w-[200px] h-[200px] flex justify-center items-center rounded-2xl border-2 border-translucent-light-4 flex-shrink-0">
        {isComingSoon ? (
          <div className="">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="120"
              height="120"
              viewBox="0 0 120 120"
              fill="none"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M60 15C35.1472 15 15 35.1472 15 60C15 84.8528 35.1472 105 60 105C84.8528 105 105 84.8528 105 60C105 35.1472 84.8528 15 60 15ZM5 60C5 29.6243 29.6243 5 60 5C90.3757 5 115 29.6243 115 60C115 90.3757 90.3757 115 60 115C29.6243 115 5 90.3757 5 60ZM61.2906 40.1216C58.963 39.7223 56.5692 40.1597 54.5332 41.3563C52.4972 42.5529 50.9504 44.4314 50.1667 46.6592C49.2503 49.2642 46.3957 50.633 43.7908 49.7167C41.1858 48.8003 39.817 45.9457 40.7333 43.3408C42.3007 38.8852 45.3943 35.1282 49.4664 32.735C53.5384 30.3418 58.326 29.467 62.9812 30.2655C67.6364 31.064 71.8588 33.4843 74.9005 37.0976C77.9422 40.711 79.607 45.2843 79.6 50.0074L74.6 50H79.6C79.6 50.0025 79.6 50.005 79.6 50.0074C79.5963 57.6576 73.9242 62.7098 69.8735 65.4103C67.6953 66.8624 65.5528 67.9301 63.9744 68.6316C63.1782 68.9855 62.5077 69.254 62.0245 69.4381C61.7825 69.5303 61.5863 69.6017 61.4435 69.6525C61.3721 69.6779 61.3139 69.6982 61.2699 69.7133L61.2145 69.7322L61.1951 69.7388L61.1841 69.7424C61.1826 69.7429 61.1811 69.7434 59.6 65L58.0189 60.2566C58.018 60.2569 58.0171 60.2572 58.0162 60.2575L58.0934 60.2303C58.1703 60.203 58.2964 60.1572 58.4646 60.0932C58.8017 59.9647 59.3031 59.7645 59.9131 59.4934C61.1472 58.9449 62.7547 58.1376 64.3265 57.0897C67.7745 54.7911 69.6 52.3457 69.6 50L69.6 49.9926C69.6035 47.631 68.7711 45.3443 67.2503 43.5376C65.7294 41.731 63.6182 40.5208 61.2906 40.1216ZM58.009 60.2599C55.3957 61.137 53.9845 63.9647 54.8566 66.5811C55.7298 69.2009 58.5614 70.6167 61.1811 69.7434L59.6 65C58.0189 60.2566 58.0175 60.257 58.0162 60.2575L58.009 60.2599C58.0093 60.2598 58.0084 60.2601 58.009 60.2599ZM55 85C55 82.2386 57.2386 80 60 80H60.05C62.8114 80 65.05 82.2386 65.05 85C65.05 87.7614 62.8114 90 60.05 90H60C57.2386 90 55 87.7614 55 85Z"
                fill="white"
                fillOpacity="0.16"
              />
            </svg>
          </div>
        ) : (
          <img
            src={image}
            alt={name}
            className="w-[160px] h-[160px] object-contain"
          />
        )}
      </div>
      <div className="flex flex-col gap-8">
        <div>
          <h3 className="text-h3 text-white font-[600] whitespace-nowrap">
            {name}
          </h3>
          <p className="text-body-1-medium font-pally text-translucent-light-64">
            {description}
          </p>
        </div>
        <div className="flex justify-between items-end">
          <button
            className={`bg-light-primary text-button-56 font-[600] px-6 py-4 rounded-[12px] ${isComingSoon ? "cursor-not-allowed" : ""}`}
            onClick={
              isComingSoon ? () => setShowComingSoonModal(true) : onPress
            }
          >
            {isComingSoon ? "Coming Soon" : "Play Now"}
          </button>
        </div>
      </div>

      {/* Coming Soon Modal */}
      <Dialog open={showComingSoonModal} onOpenChange={setShowComingSoonModal}>
        <DialogContent className="bg-dark-secondary border-light-primary/20">
          <DialogHeader>
            <DialogTitle className="text-light-primary text-xl font-bold">
              Coming Soon!
            </DialogTitle>
            <DialogDescription className="text-light-primary/80">
              This game is currently in development
            </DialogDescription>
          </DialogHeader>
          <div className="text-light-primary/70">
            <p>This game is still in development and will be available soon.</p>
            <p className="mt-2">Stay tuned for updates!</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GameCard;
