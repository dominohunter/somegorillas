"use client";
import React, { useEffect, useState } from "react";
import { GlareButton } from "../ui/glare-button";
import { ArrowRight } from "lucide-react";
import HelpPopup from "./help-popup";
import GymDialog from "./gym-dialog";
import SingleStake from "./single-stake";
import { getEthersObjects } from "@/lib/contract-helpers"
import { useAccount } from "wagmi";

export default function GymAdventure() {
  const account = useAccount()
  const [showStaking, setShowStaking] = useState(false)
  const [stakes, setStakes] = useState([])
  const [state, setState] = useState<"idle" | "loading">("idle")

  useEffect(() => {
    getUserStakes()
  }, [])

  async function getUserStakes() {
    if (account.address == undefined) return;
    setState("loading")

    const { stakingContract } = await getEthersObjects()
    const stakes = await stakingContract.getUserStakes(account.address)
    if (stakes.length > 0) {
      setStakes(stakes)
      setState("idle")
    }
  }

  return (
    <>
      <section className="px-6 grid gap-4 w-6/12 mx-auto">
        {showStaking && (<GymDialog onClose={() => setShowStaking(false)} />)}

        {/* Header section */}
        <div className="flex justify-between items-center py-5 pr-5 pl-7 rounded-2xl border-[2px] border-translucent-light-4 bg-translucent-light-4 backdrop-blur-2xl">
          <h1 className="text-h3 font-semibold text-light-primary">Stake</h1>
          <GlareButton
            background="rgba(255, 255, 255, 1)"
            borderRadius="8px"
            className="pr-4 pl-5 py-3 flex items-center justify-center gap-[10px] border border-translucent-light-4"
            onClick={() => setShowStaking(true)}
          >
            <span className="text-button-48 font-semibold text-dark-primary">
              Stake Gorilla
            </span>
            <ArrowRight className="h-5 w-5" />
          </GlareButton>
        </div>
        {/* Main grid bro */}
        <div className="grid grid-cols-1 gap-4 items-start">
          {/* Gym section */}
          <div className="bg-translucent-light-4 w-full border-[2px] border-translucent-light-4 backdrop-blur-2xl p-3 grid gap-3 rounded-2xl">
            <div className="flex items-center py-4 pr-4 pl-5 h-[72px] border-[2px] border-translucent-light-4 rounded-2xl justify-between w-full">
              <h1 className="text-h5 font-semibold text-light-primary">
                Gym-Flexible Staking
              </h1>
              <HelpPopup type="gym" />
            </div>

            <div className="border-[2px] border-translucent-light-4 bg-translucent-light-4 rounded-2xl overflow-hidden">
              <div className="grid gap-5 p-4 max-h-[668px] overflow-y-auto">
                {state === "loading" && (
                  <p className="text-white text-center">Loading...</p>
                )}

                {stakes.map((id: number) => (
                  <SingleStake nftId={id} key={id} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}