import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TransactionLoadingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TransactionLoadingDialog: React.FC<TransactionLoadingDialogProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md text-center backdrop-blur-[60px] bg-translucent-dark-12 border-2 border-translucent-light-4 rounded-2xl"
        showCloseButton={false}
      >
        <DialogHeader className="items-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#F5BA31]/20 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#F5BA31] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            Preparing Game
          </DialogTitle>
          <DialogDescription className="text-translucent-light-64">
            Setting up your mine game... Please wait.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};