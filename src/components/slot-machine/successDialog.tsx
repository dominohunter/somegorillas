"use client";

import React from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface Gorilla {
  id: number;
  image: string;
}

interface SuccessDialogProps {
  open: boolean;
  onClose: () => void;
  deposited: Gorilla | null;
  received: Gorilla | null;
  setStep: (step: string) => void;
  setSelectedGorilla: (gorilla: Gorilla | null) => void;
}

export default function SuccessDialog({
  open,
  onClose,
  deposited,
  received,
  setStep,
  setSelectedGorilla,
}: SuccessDialogProps) {
  if (!deposited || !received) return null;
  const handleConfirm = () => {
    onClose();
    setStep("initial");
    setSelectedGorilla(null);
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-translucent-light-4 !max-w-[584px] border-[2px] border-translucent-light-4 rounded-[20px] backdrop-blur-[80px] p-6 text-center">
        <div className="flex flex-col items-center gap-8">
        <DialogTitle>
            <div className="flex flex-col items-center gap-5">
            <div className="h-16 w-16 border-[2px] border-translucent-light-4 p-4 bg-translucent-light-4 rounded-[12px]">
              <Image
                src="/stake/checkYellow.svg"
                alt="stake check image"
                height={32}
                width={32}
                className="w-8 h-8 object-cover"
              />
            </div>

            <div className="text-center grid gap-1">
              <p className="text-h4 font-semibold text-light-primary">
                Swap Completed!
              </p>
            </div>
          </div>
        </DialogTitle>

          {/* Deposit / Received cards */}
          <div className="flex items-center gap-4">
            {/* Deposited */}
            <div className="flex flex-col w-[232px] h-[324px] items-center gap-4 border-2 border-translucent-light-4 bg-translucent-light-4 rounded-[16px] p-4">
              <p className="text-body-2-medium text-translucent-light-64 font-medium">
                You deposited
              </p>
              <div className="border-2 border-translucent-light-4 bg-translucent-light-4 rounded-[12px] p-3 grid gap-3">
                <Image
                  src={deposited.image}
                  alt={`Deposited #${deposited.id}`}
                  width={176}
                  height={176}
                  className="rounded-[8px]"
                />
                <p className="text-light-primary text-caption-1-medium font-medium">
                  Some Gorillas #{deposited.id}
                </p>
                <p className="text-accent-yellow text-caption-2-medium font-medium">
                  Rarity B
                </p>
              </div>
            </div>

            <span className="text-light-primary text-xl">→</span>

            {/* Received */}
            <div className="flex flex-col w-[232px] h-[324px] items-center gap-4 border-2 border-translucent-light-4 bg-translucent-light-4 rounded-[16px] p-4">
              <p className="text-body-2-medium text-translucent-light-64 font-medium  text-accent-yellow">
                You received
              </p>
              <div className="border-2 border-translucent-light-4 bg-translucent-light-4 rounded-[12px] p-3 grid gap-3">
                <Image
                  src={received.image}
                  alt={`Received #${received.id}`}
                  width={176}
                  height={176}
                  className="rounded-[8px]"
                />
                <p className="text-light-primary text-caption-1-medium font-medium">
                  Some Gorillas #{received.id}
                </p>
                <p className="text-accent-yellow text-caption-2-medium font-medium">
                  Rarity B
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleConfirm}
            className="rounded-[8px] h-[56px] w-full cursor-pointer bg-light-primary text-dark-primary px-6 py-3 text-button-48 font-semibold hover:bg-light-primary"
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
