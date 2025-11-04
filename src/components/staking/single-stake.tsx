import Image from "next/image";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { getEthersObjects } from "@/lib/contract-helpers"
import { useAccount } from "wagmi";
import { formatEther } from "ethers";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { DialogHeader } from "../ui/dialog";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useStats } from "@/lib/query-helper";
import { useRouter } from "next/navigation";

export default function SingleStake({ nftId }: { nftId: number }) {
    const { refetch: refetchUserData } = useStats();
    const account = useAccount()
    const router = useRouter();
    // const [state, setState] = useState<"idle" | "loading">("idle")
    const [stakeDate, setStakeDate] = useState<string>("...")
    const [earnedBanana, setEarnedBanana] = useState<string>("...")
    const [dialogState, setDialogState] = useState<"idle" | "no_staking">("idle")
    const [claimStatus, setClaimStatus] = useState<"idle" | "loading" | "done">("idle")
    const [unstakeStatus, setUnstakeStatus] = useState<"idle" | "loading" | "done">("idle")

    useEffect(() => {
        getNftState(nftId)
    }, [])


    useEffect(() => {
        const intervalId = setInterval(() => {
            checkBananaReward(nftId)
        }, 2500);

        return () => {
            clearInterval(intervalId);
        };
    }, [])

    async function handleUnstake() {
        if (account.address == undefined) return;
        setUnstakeStatus("loading")

        try {
            await api.post("/staking/gym/unstake", { nftId: parseInt(nftId.toString()) });
            await refetchUserData()
            toast.success("NFT Unstake Complete!");
            setTimeout(() => { router.push("/stake") }, 1500);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            if (error?.response.data?.error == "LOCKED_TIME") {
                toast.error("NFT is still in locked period!");
            } else {
                toast.error("There was an issue!");
                console.log(error.response.data.error)
            }
        }

        setUnstakeStatus("done")
    }

    async function handleClaim() {
        if (account.address == undefined) return;
        setClaimStatus("loading")

        try {
            await api.post("/staking/gym/claim", { nftId: parseInt(nftId.toString()) });
            await refetchUserData()
            setEarnedBanana(`🍌 ${0}`)
            toast.success("NFT Claim Complete!");
        } catch (error) {
            console.log(error)
            toast.error("There was an issue!");
        }

        setClaimStatus("done")
    }

    return (
        <div className="border-[2px] border-translucent-light-4 bg-translucent-light-4 p-4 grid gap-5 rounded-[12px]">
            <Dialog modal={true} open={dialogState !== "idle"} onOpenChange={(open) => { if (!open) { setDialogState("idle") } }}>
                <DialogContent className="bg-translucent-light-4 border-[2px] border-translucent-light-4 rounded-[20px] backdrop-blur-[80px] p-6 gap-5">
                    <DialogHeader>
                        <DialogTitle className="text-h3 font-semibold text-light-primary">
                            Im am sorry
                        </DialogTitle>
                        <div className="flex gap-x-1 items-center">
                            <p className="text-translucent-light-64 text-body-2-medium">
                                Banana Reward isn&apos;t available for now. Please try again later.
                            </p>
                        </div>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
            <div className="flex items-center gap-5">
                <Image
                    src={`https://ipfs.io/ipfs/QmbnysxVotw1juoq6eBtZapqpw6NLHqTGVbuRFsKgHJKEK/${nftId}`}
                    alt="nft-img"
                    width={60}
                    height={60}
                    className="object-cover aspect-square rounded-[8px]"
                />
                <h1 className="text-body-1-medium font-medium text-light-primary">
                    Some Gorillas #{nftId}
                </h1>
            </div>

            <div className="flex w-full gap-3">
                <InfoCard label="Start date" value={stakeDate} />
                <InfoCard label="Bananas per day" value="🍌 2200" />
                <InfoCard label="Total banana earned" value={earnedBanana} />
            </div>

            <div className="grid grid-cols-2 w-full gap-3 h-12">
                <Button className="btn h-full" onClick={() => handleUnstake()} disabled={unstakeStatus === "loading"}>
                    {unstakeStatus === "loading" ? "..." : "Unstake"}
                </Button>

                <Button className="btn h-full" onClick={() => handleClaim()} disabled={claimStatus === "loading"}>
                    {claimStatus === "loading" ? "..." : "Claim"}
                </Button>
            </div>
        </div>
    )

    async function getNftState(id: number) {
        const { stakingContract } = await getEthersObjects()
        const stake = await stakingContract.stakes(BigInt(id))
        const startDateMilliseconds = parseInt(stake[1]) * 1000
        const startDate = new Date(startDateMilliseconds)
        const formattedDate = startDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            timeZone: 'UTC'
        });

        setStakeDate(formattedDate)
    }

    async function checkBananaReward(id: number) {
        if (account.address == undefined) return;
        const { stakingContract } = await getEthersObjects()

        const bananaPendingReward = await stakingContract.bananaPending(BigInt(id))
        setEarnedBanana(`🍌 ${formatEther(bananaPendingReward)}`)
    }

}

function InfoCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="border-[2px] min-w-[192px] min-h-[72px] border-translucent-light-4 bg-translucent-light-4 rounded-[8px] py-3 px-4 grid gap-1">
            <p className="text-caption-1-medium text-translucent-light-80 font-medium">
                {label}
            </p>
            <h1 className="text-body-2-medium text-light-primary font-medium h-6">
                {value}
            </h1>
        </div>
    );
}