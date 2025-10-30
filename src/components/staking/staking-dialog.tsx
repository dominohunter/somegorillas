"use client";
import React from "react";
import Image from "next/image";
import { Button } from "../ui/button";

interface StakingDialogProps {
  onChoose: (type: "gym" | "adventure") => void;
}

export default function StakingDialog({ onChoose }: StakingDialogProps) {
  const stakingOptions = [
    {
      key: "gym",
      title: "Gym - Flexible Staking",
      description:
        "Train your Gorilla, earn your Bananas. Stake your NFT in the Gym to start farming Banana points with no lockup. Unstake anytime with a 14 day cooldown. Steady Banana yield with freedom to move whenever you want.",
      icon: "/stake/clock.svg",
      features: [
        "Unstake anytime after 14 day cooldown.",
        "Steady Banana yield for consistent rewards.",
        "Flexible option for users who want liquidity.",
        "Easier entry point for new users.",
      ],
    },
    {
      key: "adventure",
      title: "Adventure - Locked Staking",
      description:
        "Send your Gorilla on an epic journey. Choose a 30, 60, or 90-day Adventure. The longer the lock, the stronger the rewards: higher Banana yield plus exclusive Trait Upgrade drops. When your Gorilla returns, it comes back stronger than before.",
      icon: "/stake/lock.svg",
      features: [
        "Higher Banana yield than flexible staking.",
        "Choice of 30, 60, or 90-day lock periods.",
        "Longer locks give stronger rewards.",
        "Adds a sense of gamification and progression.",
      ],
    },
  ];

  return (
    <section className="flex flex-col md:flex-row gap-4 max-w-full overflow-x-auto">
      {stakingOptions.map((option) => (
        <div
          key={option.key}
          className="relative rounded-2xl bg-translucent-light-4 border-[2px] border-translucent-light-4 p-4 min-w-[300px] max-h-[80vh] flex flex-col"
        >
          <div className="flex-1 overflow-y-auto grid gap-6">
            <div className="grid gap-4 p-2">
              <span className="h-[64px] w-[64px] p-4 border-2 border-translucent-light-8 bg-translucent-light-8 rounded-2xl flex items-center justify-center">
                <Image
                  src={option.icon}
                  alt={`${option.title} icon`}
                  height={32}
                  width={32}
                  className="w-8 h-8 object-cover drop-shadow-[0_0_15px_rgba(255,255,255,0.6)] glow"
                />
              </span>
              <div className="grid gap-2">
                <h5 className="text-h5 text-light-primary font-semibold">
                  {option.title}
                </h5>
                <p className="font-normal text-[16px] leading-6 font-pally text-translucent-light-72">
                  {option.description}
                </p>
              </div>
            </div>

            <div className="border-[2px] border-translucent-light-4 bg-translucent-light-4 p-4 grid gap-3 rounded-[8px]">
              {option.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Image
                    src="/stake/check.svg"
                    alt="stake check"
                    height={20}
                    width={20}
                    className="w-5 h-5 object-cover"
                  />
                  <p className="font-normal text-[16px] leading-6 font-pally text-translucent-light-72">
                    {feature}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 sticky bottom-0">
            <Button
              variant="secondary"
              className="h-12 w-full px-5 py-3 rounded-[8px] bg-light-primary text-dark-primary"
              onClick={() => onChoose(option.key as "gym" | "adventure")}
              disabled={option.key == "adventure"}
            >
              Choose
            </Button>
          </div>
        </div>
      ))}
    </section>
  );
}
