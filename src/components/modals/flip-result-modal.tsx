"use client";
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import CoinHead from "../icons/coin-head";
import CoinButt from "../icons/coin-butt";
import GlareButton from "../ui/glare-button";
import { formatFlipSide } from "@/lib/utils";
import Banana from "../icons/banana";

interface FlipResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: {
    result: string;
    prediction: string;
    isWin: boolean;
  } | null;
}

const FlipResultModal: React.FC<FlipResultModalProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  if (!result) return null;

  const getCoinIcon = () => {
    const coinResult = result.result.toLowerCase();
    if (coinResult === "heads" || coinResult === "head") {
      return <CoinHead size={120} />;
    } else {
      return <CoinButt size={120} />;
    }
  };

  // Calculate XP earned based on flip result
  const getXpEarned = () => {
    const baseXp = 3; // 3 XP for every flip
    const bonusXp = result.isWin ? 2 : 0; // +2 XP if correct
    return baseXp + bonusXp;
  };

  const xpEarned = getXpEarned();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-md bg-translucent-dark-12 border-translucent-light-4 backdrop-blur-3xl rounded-3xl p-8 text-center"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="text-h4 text-light-primary font-semibold mb-6">
            {result.isWin ? (
              <div className="bg-system-success-quaternary border-system-success-tertiary border rounded-2xl px-6 py-3">
                <p className="text-system-success-primary text-h5 font-semibold text-center">
                  Congrats!!!
                </p>
              </div>
            ) : (
              <div className="bg-translucent-light-8 border border-translucent-light-4 rounded-2xl px-6 py-3">
                <p className="text-light-primary text-h5 font-semibold text-center">
                  Better Luck, Next time!
                </p>
              </div>
            )}
          </DialogTitle>
          <DialogDescription className="text-light-primary/80 text-center">
            Your coin flip results and banana rewards
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6">
          {/* Coin Result */}
          <div className="relative">
            {getCoinIcon()}
            {result.isWin && (
              <div className="absolute inset-0 animate-pulse">
                {getCoinIcon()}
              </div>
            )}
          </div>

          {/* Result Info */}
          <div className="space-y-2">
            <h3 className="text-h5 text-accent-primary  font-pally font-semibold">
              {formatFlipSide(result.result)}
            </h3>
          </div>

          <div className="w-full space-y-3">
            {/* XP Earned Display */}
            <div className="bg-accent-primary/12 border border-accent-primary/24 rounded-2xl px-4 py-3">
              <div className="flex items-center justify-center space-x-2">
                <Banana size={32} />
                <span className="text-white font-semibold text-lg">
                  +{xpEarned} Bananas
                </span>
              </div>
            </div>

            {/* XP Breakdown */}
            <div className="bg-translucent-dark-8 border border-translucent-light-4 rounded-xl px-4 py-3 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-translucent-light-64 font-pally">
                  Base flip reward
                </span>
                <span className="text-white font-medium">+3 Bananas</span>
              </div>

              {result.isWin ? (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-system-success-primary font-pally">
                    Correct prediction bonus
                  </span>
                  <span className="text-system-success-primary font-medium">
                    +2 Bananas
                  </span>
                </div>
              ) : (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-translucent-light-48 font-pally">
                    Correct prediction bonus
                  </span>
                  <span className="text-translucent-light-48 font-medium">
                    +0 Bananas
                  </span>
                </div>
              )}

              <div className="border-t border-translucent-light-4 pt-2">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-white font-pally">Total earned</span>
                  <span className="text-accent-primary">
                    +{xpEarned} Bananas
                  </span>
                </div>
              </div>
            </div>
          </div>

          <GlareButton
            onClick={onClose}
            background={"#FAFAFA"}
            borderRadius="12px"
            borderColor="transparent"
            glareColor="#ffffff"
            glareOpacity={0.3}
            width="100%"
            className="text-dark-primary py-3 px-6 text-button56 font-semibold"
          >
            Confirm
          </GlareButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FlipResultModal;
