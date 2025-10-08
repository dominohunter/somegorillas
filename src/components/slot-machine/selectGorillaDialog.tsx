"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Gorilla {
  id: number;
  image: string;
}

interface SelectGorillaDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (selected: Gorilla) => void;
  gorillas: Gorilla[];
}

export default function SelectGorillaDialog({
  open,
  onClose,
  onConfirm,
  gorillas,
}: SelectGorillaDialogProps) {
  const [selected, setSelected] = useState<Gorilla | null>(null);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-translucent-light-4 max-w-[95vw] sm:max-w-[90vw] lg:max-w-[1000px] border-[2px] border-translucent-light-4 rounded-[20px] backdrop-blur-[80px] p-6 gap-5">
        <DialogHeader>
          <DialogTitle className="text-h3 font-semibold text-light-primary">
            Gorilla Gym
          </DialogTitle>
          <p className="text-translucent-light-64 text-body-2-medium">
            Choose your Some Gorilla to stake on Gorilla Gym
          </p>
        </DialogHeader>

        {/* NFT Grid */}
        <div className="border-[2px] border-translucent-light-4 bg-translucent-light-4 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-4 max-h-[480px] overflow-y-auto">
            {gorillas.map((g) => (
              <div
                key={g.id}
                onClick={() => setSelected(g)}
                className={`relative rounded-xl p-3 border-[2px] h-fit w-full transition-all duration-200 cursor-pointer ${
                  selected?.id === g.id
                    ? "border-white bg-white"
                    : "border-translucent-light-4 bg-translucent-light-4"
                }`}
              >
                <div className="relative overflow-hidden rounded-lg">
                  <Image
                    src={g.image}
                    alt={`Gorilla #${g.id}`}
                    width={187}
                    height={187}
                    className="object-cover w-full h-auto aspect-square"
                  />
                </div>
                <div className="flex flex-col gap-1 text-center mt-2">
                  <span
                    className={`text-caption-1-medium font-medium ${
                      selected?.id === g.id
                        ? "text-dark-primary"
                        : "text-light-primary"
                    }`}
                  >
                    #{g.id}
                  </span>
                  <span
                    className={`text-caption-2-medium font-medium ${
                      selected?.id === g.id
                        ? "text-dark-primary"
                        : "text-accent-yellow"
                    }`}
                  >
                    Rarity B
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Confirm Button */}
        <div className="flex justify-center">
          <Button
            disabled={!selected}
            onClick={() => selected && onConfirm(selected)}
            className={`rounded-[8px] px-6 py-4 text-button-56 font-semibold cursor-pointer transition-all duration-200 ${
              selected
                ? "bg-light-primary text-dark-primary hover:bg-light-primary cursor-pointer"
                : "bg-light-primary text-dark-primary opacity-50 cursor-not-allowed"
            }`}
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
