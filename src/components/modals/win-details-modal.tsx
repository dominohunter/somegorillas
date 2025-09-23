"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import CoinHead from "../icons/coin-head";
import CoinButt from "../icons/coin-butt";
import Banana from "../icons/banana";
import { GlareButton } from "../ui/glare-button";
import { ethers } from "ethers";

interface WinDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  winDetails: {
    betId: string;
    userChoice: string;
    actualResult: string;
    betAmount: string;
    winAmount: string;
    multiplier: number;
    transactionHash?: string;
  } | null;
}

const WinDetailsModal: React.FC<WinDetailsModalProps> = ({
  isOpen,
  onClose,
  winDetails,
}) => {
  if (!winDetails) return null;

  const getCoinIcon = (choice: string) => {
    const coin = choice.toLowerCase();
    if (coin === "heads" || coin === "head") {
      return <CoinHead size={120} />;
    } else {
      return <CoinButt size={120} />;
    }
  };

  const formatAmount = (amount: string) => {
    try {
      return parseFloat(ethers.formatEther(amount)).toFixed(4);
    } catch {
      return "0.0000";
    }
  };

  const profit =
    parseFloat(formatAmount(winDetails.winAmount)) -
    parseFloat(formatAmount(winDetails.betAmount));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-lg bg-translucent-dark-12 border-translucent-light-4 backdrop-blur-3xl rounded-3xl p-8 text-center"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="text-h4 text-light-primary font-semibold mb-6">
            <div className="bg-system-success-quaternary border-system-success-tertiary border rounded-2xl px-6 py-3">
              <p className="text-system-success-primary text-h4 font-bold text-center font-pally">
                YOU WON!
              </p>
            </div>
          </DialogTitle>
          <DialogDescription className="text-light-primary/80 text-center font-pally">
            Your bet was successful! Here are the details:
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6">
          {/* Winning Coin Animation */}
          <div className="relative">
            {getCoinIcon(winDetails.actualResult)}
            <div className="absolute inset-0 animate-pulse">
              {getCoinIcon(winDetails.actualResult)}
            </div>
          </div>

          {/* Result Info */}
          <div className="space-y-2">
            <h3 className="text-h5 text-accent-primary font-pally font-semibold">
              Result:{" "}
              {winDetails.actualResult.charAt(0).toUpperCase() +
                winDetails.actualResult.slice(1)}
            </h3>
            <p className="text-system-success-primary font-pally text-sm">
              You predicted:{" "}
              {winDetails.userChoice.charAt(0).toUpperCase() +
                winDetails.userChoice.slice(1)}{" "}
              ✓
            </p>
          </div>

          <div className="w-full space-y-4">
            {/* Win Amount Display */}
            <div className="bg-system-success-quaternary border-2 border-system-success-tertiary rounded-2xl px-6 py-4">
              <div className="space-y-3">
                <p className="text-system-success-primary text-sm font-pally font-medium">
                  Rewards Earned
                </p>
                <div className="space-y-2">
                  <p className="text-system-success-primary text-h3 font-bold font-pally">
                    {formatAmount(winDetails.winAmount)} STT
                  </p>
                  <div className="flex items-center justify-center space-x-2 bg-accent-primary/12 border border-accent-primary/24 rounded-xl px-3 py-2">
                    <Banana size={20} />
                    <span className="text-accent-primary text-sm font-pally font-medium">
                      +5 Bananas (Win Bonus)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bet Details */}
            <div className="bg-translucent-dark-8 border border-translucent-light-4 rounded-xl px-4 py-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-translucent-light-64 font-pally text-sm">
                  Bet ID
                </span>
                <span className="text-white font-medium font-mono text-sm">
                  #{winDetails.betId}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-translucent-light-64 font-pally text-sm">
                  Original Bet
                </span>
                <span className="text-white font-medium">
                  {formatAmount(winDetails.betAmount)} STT
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-translucent-light-64 font-pally text-sm">
                  Multiplier
                </span>
                <span className="text-accent-secondary font-medium">
                  {(winDetails.multiplier / 10000).toFixed(1)}x
                </span>
              </div>

              <div className="border-t border-translucent-light-4 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-system-success-primary font-pally text-sm font-medium">
                    Profit
                  </span>
                  <span className="text-system-success-primary font-bold">
                    +{profit.toFixed(4)} STT
                  </span>
                </div>
              </div>

              {winDetails.transactionHash && (
                <div className="border-t border-translucent-light-4 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-translucent-light-64 font-pally text-sm">
                      Transaction
                    </span>
                    <span className="text-blue-400 font-mono text-xs">
                      {winDetails.transactionHash.slice(0, 6)}...
                      {winDetails.transactionHash.slice(-4)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Close Button */}
          <div className="w-full pt-4 flex justify-center items-center">
            <GlareButton
              onClick={onClose}
              background="#FFD700"
              borderRadius="16px"
              borderColor="transparent"
              glareColor="#ffffff"
              glareOpacity={0.3}
              className="px-6 py-3 text-h5 font-semibold text-dark-primary font-pally"
            >
              Awesome!
            </GlareButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WinDetailsModal;
