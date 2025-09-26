"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { GlareButton } from "../ui/glare-button";
import AddFriend from "../icons/add-friend";

interface ReferralSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReferralSuccessModal: React.FC<ReferralSuccessModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-md bg-translucent-dark-12 border-translucent-light-4 backdrop-blur-3xl rounded-3xl p-8 text-center"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="text-h4 text-light-primary text-center font-semibold mb-6">
            Referral Applied!
          </DialogTitle>
          <DialogDescription className="text-light-primary/80 text-center">
            Your referral code has been successfully applied and you&apos;ve received your bonus!
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6">
          {/* Add Friend Icon */}
          <div className="relative">
            <div className="bg-translucent-light-12 border-translucent-light-4 border-2 p-6 rounded-2xl">
              <AddFriend size={80} />
            </div>
            <div className="absolute inset-0 animate-pulse opacity-50">
              <div className="bg-translucent-light-12 border-translucent-light-4 border-2 p-6 rounded-2xl">
                <AddFriend size={80} />
              </div>
            </div>
          </div>

          {/* Reward */}
          <div className="bg-translucent-light-8 border border-translucent-light-4 rounded-2xl px-6 py-3">
            <p className="text-translucent-light-64 text-caption-1-medium font-pally mb-1">
              Bonus Received
            </p>
            <p className="text-accent-primary text-h5 font-pally font-semibold">
              🍌 100 Bananas
            </p>
          </div>

          {/* Success Message */}
          <div className="space-y-2">
            <h3 className="text-h5 text-light-primary font-pally font-semibold">
              Welcome to the Community!
            </h3>
            <p className="text-translucent-light-64 text-body-2-medium font-pally">
              You&apos;ve successfully joined through a referral and earned your welcome bonus
            </p>
          </div>

          {/* Close Button */}
          <GlareButton
            onClick={onClose}
            background="#22C55E"
            borderRadius="12px"
            borderColor="transparent"
            glareColor="#ffffff"
            glareOpacity={0.3}
            width="100%"
            className="text-white py-3 px-6 text-body-1-semibold font-pally font-semibold mt-4 justify-center"
          >
            Awesome!
          </GlareButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReferralSuccessModal;