import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { XPCalculation } from "@/types/mine";

interface XPDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  xpData: XPCalculation | null;
  onClose: () => void;
}

export const XPDialog: React.FC<XPDialogProps> = ({
  open,
  onOpenChange,
  xpData,
  onClose,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg backdrop-blur-[60px] bg-translucent-dark-12 border-2 border-translucent-light-4 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-white font-bold text-xl text-center">
            Banana Earned!
          </DialogTitle>
          <DialogDescription className="text-translucent-light-64 text-center">
            Here&apos;s your Banana breakdown for this game
          </DialogDescription>
        </DialogHeader>

        {xpData && (
          <div className="space-y-4">
            {/* Total XP */}
            <div className="text-center bg-translucent-dark-24 border border-translucent-light-4 rounded-xl p-6">
              <div className="text-4xl font-bold text-[#F5BA31] mb-2">
                +{xpData.xpEarned} Bananas
              </div>
              <div className="text-translucent-light-64">
                Game State: {xpData.gameState.replace("_", " ")}
              </div>
            </div>

            {/* Game Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-translucent-dark-24 border border-translucent-light-4 rounded-xl p-4 text-center">
                <div className="text-white font-bold text-lg">
                  {xpData.tilesRevealed}
                </div>
                <div className="text-translucent-light-64 text-sm">
                  Tiles Revealed
                </div>
              </div>
              <div className="bg-translucent-dark-24 border border-translucent-light-4 rounded-xl p-4 text-center">
                <div className="text-white font-bold text-lg">
                  {xpData.mineCount}
                </div>
                <div className="text-translucent-light-64 text-sm">Mines</div>
              </div>
            </div>

            {/* XP Breakdown */}
            <div className="bg-translucent-dark-24 border border-translucent-light-4 rounded-xl p-4">
              <h4 className="text-white font-semibold mb-3">
                Banana Breakdown
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-translucent-light-64">
                    Base Banana:
                  </span>
                  <span className="text-white font-medium">
                    +{xpData.bonuses.baseXp}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-translucent-light-64">
                    Difficulty Multiplier:
                  </span>
                  <span className="text-white font-medium">
                    ×{xpData.bonuses.difficultyMultiplier}
                  </span>
                </div>
                {xpData.bonuses.perfectGameBonus > 0 && (
                  <div className="flex justify-between">
                    <span className="text-green-300">Perfect Game Bonus:</span>
                    <span className="text-green-300 font-medium">
                      +{xpData.bonuses.perfectGameBonus}
                    </span>
                  </div>
                )}
                {xpData.bonuses.firstGameBonus > 0 && (
                  <div className="flex justify-between">
                    <span className="text-purple-300">First Game Bonus:</span>
                    <span className="text-purple-300 font-medium">
                      +{xpData.bonuses.firstGameBonus}
                    </span>
                  </div>
                )}
                {xpData.bonuses.dailyFirstBonus > 0 && (
                  <div className="flex justify-between">
                    <span className="text-blue-300">Daily First Bonus:</span>
                    <span className="text-blue-300 font-medium">
                      +{xpData.bonuses.dailyFirstBonus}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {xpData.alreadyCalculated && (
              <div className="text-center text-translucent-light-64 text-sm">
                ⚠️ XP was already calculated for this game
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            onClick={onClose}
            className="w-full bg-[#F5BA31] text-dark-primary hover:bg-[#E0A429] font-semibold"
          >
            Awesome!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
