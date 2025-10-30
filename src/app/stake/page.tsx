"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import StakingDialog from "@/components/staking/staking-dialog";
import GymDialog from "@/components/staking/gym-dialog";
import AdventureDialog from "@/components/staking/adventure-dialog";

import { getEthersObjects } from "@/lib/contract-helpers"
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";

export default function Stake() {
  const account = useAccount()
  const router = useRouter();

  const [selected, setSelected] = useState<"staking" | "gym" | "adventure" | null>("staking");

  useEffect(() => {
    checkHasAnyStake()
  }, []);

  return (
    <section className="w-full flex items-center justify-center overflow-y-hidden px-4">
      <div className="grid md:grid-cols-2 backdrop-blur-3xl grid-cols-1 gap-4 p-4 rounded-[20px] border-2 border-translucent-light-4 max-w-[880px] w-full h-auto">
        {/* Left content */}
        <div className="p-4 grid gap-3 rounded-2xl border-translucent-light-4 bg-translucent-light-4">
          <h5 className="text-h5 text-light-primary">Stake</h5>
          <p className="text-body-2-medium text-light-primary">
            Stake your Gorillas and grow your Banana stash. Hit the Gym for
            flexible yields with no lockup, or send them on Adventures for
            bigger rewards and rare upgrades. Train, explore, and come back
            stronger.
          </p>
          <div className="h-[412px] border border-translucent-light-4 bg-translucent-light-4 flex flex-col items-center justify-center gap-7 rounded-[12px]">
            <span className="h-[96px] w-[96px] p-6 border-2 border-translucent-light-8 bg-translucent-light-8 rounded-2xl">
              <Image
                src="/icons/logo-gradient.svg"
                alt="stake image"
                height={48}
                width={48}
                className="w-12 h-12 object-cover drop-shadow-[0_0_15px_rgba(255,255,255,0.6)] glow"
              />
            </span>

            {selected === "staking" && (
              <Dialog>
                <DialogTrigger
                >
                  <div className="hidden! btn py-2 px-4 rounded items-center gap-x-2">
                    <p className="text-xl">Stake Gorilla</p>
                    <ArrowRight className="size-5" />
                  </div>
                </DialogTrigger>


                <DialogContent className="h-auto min-w-[960px] overflow-y-hidden border border-translucent-light-4 bg-translucent-light-4 backdrop-blur-[80px] rounded-[20px] p-6">
                  <DialogHeader className="grid gap-5">
                    <DialogTitle className="text-h3 font-semibold text-light-primary">
                      Choose Staking Type
                    </DialogTitle>
                    <DialogDescription>
                      <StakingDialog onChoose={(type) => setSelected(type)} />
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            )}
            {selected === "gym" && (
              <GymDialog onClose={() => setSelected("staking")} />
            )}
            {selected === "adventure" && (
              <AdventureDialog onClose={() => setSelected("staking")} />
            )}
          </div>
        </div>

        {/* Right content */}
        <div className="w-full h-auto flex items-center justify-center">
          <Image
            src="/staking.png"
            draggable="false"
            alt="stake image"
            height={100}
            width={400}
            className="w-full h-full object-cover rounded-xl"
          />
        </div>
      </div>
    </section>
  );

  async function checkHasAnyStake() {
    if (account.address == undefined) return;

    const { stakingContract } = await getEthersObjects()
    const stakeBalance = parseInt((await stakingContract.getUserStakes(account.address)).length)
    if (stakeBalance > 0) {
      router.push("/stake/gym-adventure")
    }
  }
}
