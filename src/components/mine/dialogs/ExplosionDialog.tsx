import React from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Game } from "@/types/mine";

interface ExplosionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  backendGame: Game | null;
  onStartNewGame: () => void;
}

export const ExplosionDialog: React.FC<ExplosionDialogProps> = ({
  open,
  onOpenChange,
  backendGame,
  onStartNewGame,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center backdrop-blur-[60px] bg-translucent-dark-12 border-2 border-red-500/40 rounded-2xl">
        <DialogHeader className="items-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center">
            <Image
              src="/mine.svg"
              alt="Mine Explosion"
              width={40}
              height={40}
              className="w-10 h-10 filter brightness-0 invert"
            />
          </div>
          <DialogTitle className="text-2xl font-bold text-red-300">
            💥 BOOM! 💥
          </DialogTitle>
          <DialogDescription className="text-lg text-white">
            You hit a mine! Game Over - Better luck next time!
          </DialogDescription>
        </DialogHeader>

        {backendGame && (
          <div className="bg-translucent-dark-24 border border-translucent-light-4 rounded-xl p-4 my-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-translucent-light-64">Tiles Revealed</div>
                <div className="font-semibold text-lg text-white">
                  {backendGame.tilesRevealed}
                </div>
              </div>
              <div className="text-center">
                <div className="text-translucent-light-64">Total Mines</div>
                <div className="font-semibold text-lg text-white">
                  {backendGame.mineCount}
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            onClick={onStartNewGame}
            className="w-full bg-[#F5BA31] text-dark-primary hover:bg-[#E0A429] font-semibold"
            size="lg"
          >
            Start New Game
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};