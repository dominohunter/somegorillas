"use client";
import React, { useState, useEffect } from "react";
import { getEthersObjects } from "@/lib/contract-helpers"
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { GlareButton } from "../ui/glare-button";

interface Gorilla {
  id: number;
  image: string;
}

// const _gorillas: Gorilla[] = [
//   { id: 3582, image: "/gorillas/g1.svg" },
//   { id: 5653, image: "/gorillas/g2.svg" },
//   { id: 4639, image: "/gorillas/g3.svg" },
//   { id: 2744, image: "/gorillas/g4.svg" },
//   { id: 3583, image: "/gorillas/g5.svg" },
//   { id: 5634, image: "/gorillas/g6.svg" },
//   { id: 4631, image: "/gorillas/g7.svg" },
//   { id: 2740, image: "/gorillas/g8.svg" },
// ];

interface GymDialogProps {
  onClose?: () => void;
}


export default function GymDialog({ onClose }: GymDialogProps) {
  const account = useAccount()

  const [selected, _setSelected] = useState<Gorilla | null>(null);
  const [step, setStep] = useState<"select" | "success">("select");

  const [nftId, setNftId] = useState(0)
  const [nftState, setNftState] = useState<"idle" | "not_owner" | "found" | "searching">("idle")
  const [writeState, setWriteState] = useState<"idle" | "approving" | "staking" | "done">("idle")

  const router = useRouter();

  const handleSelectDialogChange = (open: boolean) => {
    if (!open && onClose) {
      onClose();
    }
  };

  const handleConfirmDialogChange = (open: boolean) => {
    if (!open) {
      setStep("select");
    }
  };

  const handleSuccessDialogChange = (open: boolean) => {
    if (!open && onClose) {
      onClose();
    }
  };

  useEffect(() => {
    checkHasAnyStake()
  }, [])

  async function stakeNft() {
    try {
      if (!nftId) throw new Error("No NFT selected");

      const { stakingContract, nftContract } = await getEthersObjects()

      setWriteState("approving")
      const approveTx = await nftContract.approve(stakingContract.target, nftId)
      await approveTx.wait()

      setWriteState("staking")
      const stakeTx = await stakingContract.stake(nftId)
      await stakeTx.wait()

      setWriteState("done")
      setStep("success")
    } catch (e) {
      console.log(e)
      setWriteState("idle")
    }

  }

  async function checkHasAnyStake() {
    if (account.address == undefined) return;

    const { stakingContract } = await getEthersObjects()
    const stakeBalance = parseInt((await stakingContract.getUserStakes(account.address)).length)
    console.log(stakeBalance)
  }

  async function checkNftOwnership(id: number) {
    if (account.address == undefined) return;

    setNftState("searching")

    const { nftContract } = await getEthersObjects()
    const nftAddress = await nftContract.ownerOf(id)

    if (nftAddress == account.address) {
      setNftState("found")
    } else {
      setNftState("not_owner")
    }
  }

  return (
    <>
      <Dialog open={step === "select"} onOpenChange={handleSelectDialogChange}>
        <DialogContent className="bg-translucent-light-4 border-[2px] border-translucent-light-4 rounded-[20px] backdrop-blur-[80px] p-6 gap-5">
          <DialogHeader>
            <DialogTitle className="text-h3 font-semibold text-light-primary">
              Gorilla Gym
            </DialogTitle>
            <div className="flex gap-x-1 items-center">
              <p className="text-translucent-light-64 text-body-2-medium">
                Are you ready to stake your nft?
              </p>
            </div>
          </DialogHeader>

          {writeState === "approving" && (
            <div className="text-translucent-light-64 bg-translucent-light-4 rounded-[12px] p-4 border-[2px] border-translucent-light-4 text-body-2-medium font-medium">
              <p className="text-center">Approving...</p>
            </div>
          )}

          {writeState === "staking" && (
            <div className="text-translucent-light-64 bg-translucent-light-4 rounded-[12px] p-4 border-[2px] border-translucent-light-4 text-body-2-medium font-medium">
              <p className="text-center">Staking...</p>
            </div>
          )}

          {writeState === "idle" && (
            <div className="grid gap-y-4">
              <p className="text-translucent-light-64 bg-translucent-light-4 rounded-[12px] p-4 border-[2px] border-translucent-light-4 text-body-2-medium font-medium">
                You can unstake anytime, but your Gorilla has a 13-day cooldown
                before returning.
              </p>

              <div className="border-[2px] border-translucent-light-4 bg-translucent-light-4 rounded-2xl overflow-hidden">
                <div className="p-4 text-white flex flex-col md:flex-row mx-auto text-center gap-4 items-center w-full">
                  <p className="grow uppercase">NFT Id</p>
                  <input type="number" onChange={(e: any) => { setNftId(e.target.value) }} placeholder="0" className="pl-2 text-center border border-white rounded-xl appearance-none" />
                  <Button onClick={() => checkNftOwnership(nftId)} className="btn w-full md:w-3/12" >
                    Check
                  </Button>
                </div>
              </div>


              {nftState === "idle" && (
                <div className="border-[2px] border-translucent-light-4 bg-translucent-light-4 rounded-2xl overflow-hidden h-20 flex items-center justify-center">
                  <a href={`https://explorer.somnia.network/address/${account.address}?tab=tokens_nfts`} className="hover:text-gray-300 text-green-200" target="_blank">View your NFT's</a>
                </div>
              )}

              {nftState === "searching" && (
                <div className="border-[2px] border-translucent-light-4 bg-translucent-light-4 rounded-2xl overflow-hidden h-20 flex items-center justify-center">
                  <p className="text-white">Searching...</p>
                </div>
              )}

              {nftState === "not_owner" && (
                <div className="border-[2px] border-translucent-light-4 bg-translucent-light-4 rounded-2xl overflow-hidden h-20 flex flex-col items-center justify-center">
                  <p className="text-white">Not Owner</p>
                  <a href={`https://explorer.somnia.network/address/${account.address}?tab=tokens_nfts`} className="hover:text-gray-300 text-green-200 block" target="_blank">View your NFT's</a>
                </div>
              )}

              {nftState === "found" && (
                <div className="border-[2px] border-translucent-light-4 bg-translucent-light-4 rounded-2xl flex flex-col gap-y-2 p-4 items-center justify-center">
                  <Image
                    src={`https://ipfs.io/ipfs/QmbnysxVotw1juoq6eBtZapqpw6NLHqTGVbuRFsKgHJKEK/${nftId}`}
                    alt={"gorillas-nft"}
                    width={200}
                    height={200}
                    className="object-cover rounded-lg"
                  />
                  <p className="text-white text-sm">NFT {nftId}</p>

                  <div className="flex gap-x-4">
                    <GlareButton
                      onClick={() => stakeNft()}
                      className="pr-4 pl-5 py-3 flex items-center justify-center gap-[10px] border border-translucent-light-4 text-button-48 font-semibold text-dark-primary rounded-sm bg-white"
                    >
                      Stake Gorilla
                    </GlareButton>
                  </div>
                </div>
              )}

            </div>
          )}

        </DialogContent>
      </Dialog>

      {/* === SUCCESS DIALOG === */}
      <Dialog open={step === "success"} onOpenChange={handleSuccessDialogChange}>
        <DialogContent className="max-w-[420px] bg-translucent-light-4 border-[2px] border-translucent-light-4 rounded-2xl backdrop-blur-[80px] text-white text-center">
          <DialogHeader>
            <div className="flex flex-col items-center pt-4 pb-2 gap-5">
              <div className="border-[2px] border-translucent-light-4 p-4 bg-translucent-light-4 rounded-[12px]">
                <Image
                  src="/stake/checkYellow.svg"
                  alt="stake check image"
                  height={32}
                  width={32}
                  className="w-8 h-8 object-cover"
                />
              </div>
              <DialogTitle className="text-center grid gap-1">
                <p className="text-h5 text-light-primary">Successful!</p>
                <p className="text-translucent-light-64 text-body-2-medium">
                  You successfully staked your Gorilla on Gym.
                </p>
              </DialogTitle>
            </div>
          </DialogHeader>

          {selected && (
            <div className="border-[2px] border-translucent-light-4 bg-translucent-light-4 rounded-[12px] pt-8 pb-6 flex flex-col gap-6 items-center">
              <Image
                src={selected.image}
                alt={`Gorilla #${selected.id}`}
                width={160}
                height={160}
                className="rounded-[8px]"
              />
              <p className="text-body-1-medium text-light-primary font-medium">
                Some Gorillas #{selected?.id}
              </p>
            </div>
          )}
          <Button
            onClick={() => router.push("/stake/gym-adventure")}
            className="w-full border-[2px] border-translucent-light-4 text-button-48 font-semibold text-dark-primary bg-light-primary px-5 py-3 h-12 hover:bg-light-primary"
          >
            Okay
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );

}