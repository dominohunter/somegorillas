"use client";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import AchievementsSection from "../sections/achievement-section";
import { Achievement } from "@/lib/types";

interface AchievementsModalProps {
  isModalOpen: boolean;
  setIsModalOpen: () => void;
  achievements: Achievement[];
  onClaim: (id: string) => void;
  isClaimPending: boolean;
}

const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isModalOpen,
  setIsModalOpen,
  achievements,
  onClaim,
  isClaimPending,
}) => {
  const [claimingId, setClaimingId] = useState<string | undefined>();

  const handleClaim = (id: string) => {
    setClaimingId(id);
    onClaim(id);
  };

  // Reset claimingId when claim is no longer pending
  React.useEffect(() => {
    if (!isClaimPending) {
      setClaimingId(undefined);
    }
  }, [isClaimPending]);
  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent
        className="sm:max-w-4xl bg-translucent-dark-12 border-translucent-light-4 backdrop-blur-3xl rounded-3xl max-h-[80vh] overflow-hidden flex flex-col"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="text-h5 text-light-primary text-start leading-loose tracking-tight text-2xl font-semibold">
            Achievements
          </DialogTitle>
          <DialogDescription className="text-light-primary/80 text-start">
            View and claim your achievements
          </DialogDescription>
        </DialogHeader>

        <AchievementsSection
          achievements={achievements}
          onClaim={handleClaim}
          claimingId={claimingId}
          showTitle={false}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AchievementsModal;
