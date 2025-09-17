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

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mineCount: number;
  gameFee: string;
  onConfirm: () => void;
  isGameDisabled: boolean;
  getStartButtonText: () => string;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onOpenChange,
  mineCount,
  gameFee,
  onConfirm,
  isGameDisabled,
  getStartButtonText,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md backdrop-blur-[60px] bg-translucent-dark-12 border-2 border-translucent-light-4 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-white font-bold text-xl">
            Confirm Game Start
          </DialogTitle>
          <DialogDescription className="text-translucent-light-64">
            Please review your game settings before starting.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-translucent-light-64">Mines:</span>
            <span className="font-semibold text-white">{mineCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-translucent-light-64">Bet Amount:</span>
            <span className="font-semibold text-white">{gameFee} STT</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-translucent-light-64">Board Size:</span>
            <span className="font-semibold text-white">5x5 (25 tiles)</span>
          </div>
        </div>
        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 bg-translucent-light-8 text-white border-translucent-light-4 hover:bg-translucent-light-16"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isGameDisabled}
            className="flex-1 bg-[#F5BA31] text-dark-primary hover:bg-[#E0A429] font-semibold"
          >
            {getStartButtonText()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
