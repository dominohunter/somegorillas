"use client";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import AchievementCoin from "../icons/achievement-coin";
import GlareButton from "../ui/glare-button";

interface AchievementClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievement: {
    id: string;
    title: string;
    description: string;
    xpReward: number;
  } | null;
}

const AchievementClaimModal: React.FC<AchievementClaimModalProps> = ({
  isOpen,
  onClose,
  achievement,
}) => {
  if (!achievement) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-md bg-translucent-dark-12 border-translucent-light-4 backdrop-blur-3xl rounded-3xl p-8 text-center"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="text-h4 text-light-primary font-semibold mb-6">
            🎉 Achievement Unlocked!
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6">
          {/* Achievement Coin */}
          <div className="relative">
            <AchievementCoin size={120} claimed={true} />
            <div className="absolute inset-0 animate-pulse">
              <AchievementCoin size={120} claimed={true} />
            </div>
          </div>

          {/* Achievement Info */}
          <div className="space-y-2">
            <h3 className="text-h5 text-light-primary font-pally font-semibold">
              {achievement.title}
            </h3>
            <p className="text-translucent-light-64 text-body-2-medium font-pally">
              {achievement.description}
            </p>
          </div>

          {/* Reward */}
          <div className="bg-translucent-light-8 border border-translucent-light-4 rounded-2xl px-6 py-3">
            <p className="text-translucent-light-64 text-caption-1-medium font-pally mb-1">
              Reward Claimed
            </p>
            <p className="text-accent-primary text-h5 font-pally font-semibold">
              🍌 {achievement.xpReward} Bananas
            </p>
          </div>

          {/* Close Button */}
          <GlareButton
            onClick={onClose}
            background="#EAB308"
            borderRadius="12px"
            borderColor="transparent"
            glareColor="#ffffff"
            glareOpacity={0.3}
            width="100%"
            className="text-white py-3 px-6 text-body-1-semibold font-pally font-semibold mt-4"
          >
            Awesome!
          </GlareButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AchievementClaimModal;
