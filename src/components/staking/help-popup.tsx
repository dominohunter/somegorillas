"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface HelpPopupProps {
  type: "gym" | "adventure";
}

export default function HelpPopup({ type }: HelpPopupProps) {
  const isGym = type === "gym";
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="h-10 w-10 cursor-pointer rounded-[8px] p-[10px] border-[2px] border-translucent-light-4 bg-translucent-light-4 hover:bg-translucent-light-4"
        >
          <Image src="/stake/help.svg" alt="help icon" width={20} height={20} />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[480px] bg-translucent-light-4 border-[2px] border-translucent-light-4 rounded-[20px] p-5 grid gap-5 backdrop-blur-[80px]">
        <div className="grid gap-6">
          <DialogHeader>
            <div className="w-16 h-16 rounded-[12px] border-[2px] border-translucent-light-4 bg-translucent-light-4 flex items-center justify-center">
              <Image
                src={isGym ? "/stake/clock.svg" : "/stake/lock.svg"}
                alt="icon"
                width={32}
                height={32}
              />
            </div>
          </DialogHeader>
          <DialogTitle className="grid gap-2">
            <p className="tet-h5 font-semibold text-light-primary">
              {isGym ? "Gym - Flexible Staking" : "Adventure - Locked Staking"}
            </p>
            <p className="text-translucent-light-72 text-[16px] leading-6 font-normal font-pally">
              {isGym
                ? "Train your Gorilla, earn your Bananas. Stake your NFT in the Gym to start farming Banana points with no lockup. Unstake anytime with a 14 day cooldown. Steady Banana yield with freedom to move whenever you want."
                : "Send your Gorilla on an epic journey. Choose a 30, 60, or 90-day Adventure. The longer the lock, the stronger the rewards: higher Banana yield plus exclusive Trait Upgrade drops. When your Gorilla returns, it comes back stronger than before."}
            </p>
          </DialogTitle>
        </div>

        <div className="bg-translucent-light-4 border-[2px] border-translucent-light-4 rounded-xl p-4 grid gap-3">
          {isGym ? (
            <>
              <div className="flex items-start gap-2">
                {" "}
                <Image
                  src="/stake/check.svg"
                  alt="stake check"
                  height={20}
                  width={20}
                  className="w-5 h-5 object-cover"
                />
                <p className="font-normal text-[16px] font-pally leading-6 text-light-primary">
                  Unstake anytime after 14 day cooldown.
                </p>
              </div>
              <div className="flex items-start gap-2">
                {" "}
                <Image
                  src="/stake/check.svg"
                  alt="stake check"
                  height={20}
                  width={20}
                  className="w-5 h-5 object-cover"
                />
                <p className="font-normal text-[16px] font-pally leading-6 text-light-primary">
                  Steady Banana yield for consistent rewards.
                </p>
              </div>
              <div className="flex items-start gap-2">
                {" "}
                <Image
                  src="/stake/check.svg"
                  alt="stake check"
                  height={20}
                  width={20}
                  className="w-5 h-5 object-cover"
                />
                <p className="font-normal text-[16px] font-pally leading-6 text-light-primary">
                  Flexible option for users who want liquidity.
                </p>
              </div>
              <div className="flex items-start gap-2">
                {" "}
                <Image
                  src="/stake/check.svg"
                  alt="stake check"
                  height={20}
                  width={20}
                  className="w-5 h-5 object-cover"
                />
                <p className="font-normal text-[16px] font-pally leading-6 text-light-primary">
                  Easier entry point for new users.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-2">
                {" "}
                <Image
                  src="/stake/check.svg"
                  alt="stake check"
                  height={20}
                  width={20}
                  className="w-5 h-5 object-cover"
                />
                <p className="font-normal text-[16px] font-pally leading-6 text-light-primary">
                  Higher Banana yield than flexible staking.
                </p>
              </div>
              <div className="flex items-start gap-2">
                {" "}
                <Image
                  src="/stake/check.svg"
                  alt="stake check"
                  height={20}
                  width={20}
                  className="w-5 h-5 object-cover"
                />
                <p className="font-normal text-[16px] font-pally leading-6 text-light-primary">
                  Choice of 30, 60, or 90-day lock periods.
                </p>
              </div>
              <div className="flex items-start gap-2">
                {" "}
                <Image
                  src="/stake/check.svg"
                  alt="stake check"
                  height={20}
                  width={20}
                  className="w-5 h-5 object-cover"
                />
                <p className="font-normal text-[16px] font-pally leading-6 text-light-primary">
                  Longer locks give stronger rewards.
                </p>
              </div>
              <div className="flex items-start gap-2">
                {" "}
                <Image
                  src="/stake/check.svg"
                  alt="stake check"
                  height={20}
                  width={20}
                  className="w-5 h-5 object-cover"
                />
                <p className="font-normal text-[16px] font-pally leading-6 text-light-primary">
                  Adds a sense of gamification and progression.
                </p>
              </div>
            </>
          )}
        </div>

        <Button
          className="w-full bg-translucent-light-4 cursor-pointer text-button-48 text-light-primary h-12 font-semibold border-[2px] border-translucent-light-4 rounded-[8px] hover:bg-translucent-light-4 py-3 px-4"
          onClick={() => setOpen(false)}
        >
          I understand
        </Button>
      </DialogContent>
    </Dialog>
  );
}
