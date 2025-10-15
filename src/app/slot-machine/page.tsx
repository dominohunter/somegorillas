"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SelectGorillaDialog from "@/components/slot-machine/selectGorillaDialog";
import SuccessDialog from "@/components/slot-machine/successDialog";
import { ethers } from "ethers";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
  useReadContract,
  useBlockNumber,
  useSimulateContract,
} from "wagmi";
import { toast } from "sonner";
import api from "@/lib/axios";
import { NFT_ABI, SLOT_MACHINE_ABI, SLOT_MACHINE_CONTRACT } from "@/lib/config";

interface Gorilla {
  id: number;
  image: string;
  rarity?: number;
}

interface GameStats {
  totalGames: number;
  totalFeePaid: string;
  tierSReceived: number;
  tierAReceived: number;
  tierBReceived: number;
  tierCReceived: number;
  tierDReceived: number;
}

interface GameHistory {
  id: string;
  depositedTokenId: number;
  receivedTokenId: number;
  receivedRarity: number;
  createdAt: string;
}

const RARITY_NAMES = {
  1: "S (Rarest)",
  2: "A",
  3: "B",
  4: "C",
  5: "D (Common)",
};

const gorillas: Gorilla[] = [
  { id: 3520, image: "/gorillas/g1.svg" },
  { id: 5621, image: "/gorillas/g2.svg" },
  { id: 4632, image: "/gorillas/g3.svg" },
  { id: 2740, image: "/gorillas/g4.svg" },
  { id: 4521, image: "/gorillas/g5.svg" },
  { id: 5830, image: "/gorillas/g6.svg" },
  { id: 6711, image: "/gorillas/g7.svg" },
  { id: 2180, image: "/gorillas/g8.svg" },
];

export default function SlotMachine() {
  const { address, isConnected } = useAccount();
  const { data: currentBlock } = useBlockNumber({ watch: true });

  // UI state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedGorilla, setSelectedGorilla] = useState<Gorilla | null>(null);
  const [step, setStep] = useState<"initial" | "pending">("initial");
  const [isPayButtonEnabled, setIsPayButtonEnabled] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [selectedDeposited, setSelectedDeposited] = useState<Gorilla | null>(
    null,
  );
  const [selectedReceived, setSelectedReceived] = useState<Gorilla | null>(
    null,
  );

  // Blockchain state
  const [secret, setSecret] = useState("");
  const [savedSecret, setSavedSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [, setLastResult] = useState<{
    deposited: number;
    received: number;
    rarity: number;
  } | null>(null);
  const [pendingTxType, setPendingTxType] = useState<string | null>(null);
  const [userNFTs, setUserNFTs] = useState<number[]>([]);
  const [nftCollectionAddress, setNftCollectionAddress] = useState<
    string | null
  >(null);
  const [isClient, setIsClient] = useState(false);
  const [selectedRarity] = useState(3);
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
  const [stats, setStats] = useState<GameStats | null>(null);

  // Simulation states
  const [commitArgs, setCommitArgs] = useState<{
    args: unknown[];
    value: bigint;
  } | null>(null);
  const [revealArgs, setRevealArgs] = useState<bigint[] | null>(null);

  // Simulate commit transaction
  const { data: commitSimulation, error: commitSimError } = useSimulateContract(
    {
      address: SLOT_MACHINE_CONTRACT,
      abi: SLOT_MACHINE_ABI,
      functionName: "commit",
      args: commitArgs?.args,
      value: commitArgs?.value,
      query: { enabled: !!commitArgs },
    },
  );

  // Simulate reveal transaction
  const { data: revealSimulation, error: revealSimError } = useSimulateContract(
    {
      address: SLOT_MACHINE_CONTRACT,
      abi: SLOT_MACHINE_ABI,
      functionName: "reveal",
      args: revealArgs || undefined,
      query: { enabled: !!revealArgs },
    },
  );

  // Wagmi write contract
  const {
    data: hash,
    error: writeError,
    writeContract,
    isPending: isWritePending,
  } = useWriteContract();

  const { isSuccess: isConfirmed, data: receipt } =
    useWaitForTransactionReceipt({
      hash,
      confirmations: 1,
    });

  // Read contract data
  const { data: playFee } = useReadContract({
    address: SLOT_MACHINE_CONTRACT,
    abi: SLOT_MACHINE_ABI,
    functionName: "playFee",
  });

  const { data: poolSize } = useReadContract({
    address: SLOT_MACHINE_CONTRACT,
    abi: SLOT_MACHINE_ABI,
    functionName: "getPoolSize",
  });

  const { data: nftCollection } = useReadContract({
    address: SLOT_MACHINE_CONTRACT,
    abi: SLOT_MACHINE_ABI,
    functionName: "nftCollection",
  });

  const { data: commitment, refetch: refetchCommitment } = useReadContract({
    address: SLOT_MACHINE_CONTRACT,
    abi: SLOT_MACHINE_ABI,
    functionName: "getCommitment",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const handleConfirm = (gorilla: Gorilla) => {
    setSelectedGorilla(gorilla);
    setStep("initial");
    setDialogOpen(false);
  };

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Set NFT collection address when loaded
  useEffect(() => {
    if (nftCollection) {
      setNftCollectionAddress(nftCollection as string);
    }
  }, [nftCollection]);

  // Load user NFTs when connected
  useEffect(() => {
    if (isConnected && address && nftCollectionAddress && isClient) {
      loadUserNFTs();
    }
  }, [isConnected, address, nftCollectionAddress, isClient]);

  // Generate secret when NFT is selected
  useEffect(() => {
    if (selectedGorilla && step === "initial" && !secret) {
      generateSecret();
      const timer = setTimeout(() => setIsPayButtonEnabled(true), 3000);
      return () => clearTimeout(timer);
    } else if (!selectedGorilla) {
      setIsPayButtonEnabled(false);
      setSecret("");
    }
  }, [selectedGorilla, step]);

  // Load game history when connected
  useEffect(() => {
    if (isConnected && address) {
      loadGameHistory(address);
    }
  }, [isConnected, address]);

  // Calculate commitment states
  const hasCommitment =
    commitment &&
    Number((commitment as unknown as { commitBlock: bigint }).commitBlock) > 0;
  const canReveal =
    hasCommitment &&
    currentBlock &&
    Number(currentBlock) >=
      Number((commitment as unknown as { commitBlock: bigint }).commitBlock) +
        2;

  // Handle commit simulation
  useEffect(() => {
    if (commitSimulation && !commitSimError && pendingTxType === "commit") {
      writeContract(commitSimulation.request);
      setCommitArgs(null);
    }
  }, [commitSimulation, commitSimError, pendingTxType]);

  // Handle reveal simulation
  useEffect(() => {
    if (revealSimulation && !revealSimError && pendingTxType === "reveal") {
      writeContract(revealSimulation.request);
      setRevealArgs(null);
    }
  }, [revealSimulation, revealSimError, pendingTxType]);

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && receipt && hash && pendingTxType) {
      if (pendingTxType === "commit") {
        processCommitConfirmation();
      } else if (pendingTxType === "reveal") {
        processRevealConfirmation();
      }
      setPendingTxType(null);
    }
  }, [isConfirmed, receipt, hash, pendingTxType]);

  // Load saved secret from sessionStorage
  useEffect(() => {
    if (isConnected && address && hasCommitment && !savedSecret) {
      if (typeof window !== "undefined") {
        const stored = sessionStorage.getItem(`slotmachine_commit_${address}`);
        if (stored) {
          try {
            const commitData = JSON.parse(stored);
            setSavedSecret(commitData.secret);
            setSecret(commitData.secret);
          } catch (e) {
            console.error("Failed to parse stored commit data:", e);
          }
        }
      }
    }
  }, [isConnected, address, hasCommitment, savedSecret]);

  // Handle commit simulation errors
  useEffect(() => {
    if (commitSimError && pendingTxType === "commit") {
      console.error("Commit simulation error:", commitSimError);
      setLoading(false);
      setPendingTxType(null);
      setCommitArgs(null);

      const errorMsg = commitSimError.message || commitSimError.toString();

      if (errorMsg.includes("Pool too small")) {
        toast.error("Pool too small", {
          description: "Not enough NFTs in the pool to play.",
        });
      } else if (errorMsg.includes("Pending commitment exists")) {
        toast.error("Commitment exists", {
          description: "You already have a pending commitment.",
        });
      } else if (errorMsg.includes("Not token owner")) {
        toast.error("Not token owner", {
          description: "You don't own this NFT.",
        });
      } else if (errorMsg.includes("Insufficient fee")) {
        toast.error("Insufficient fee", {
          description: "Increase the transaction value.",
        });
      } else {
        toast.error("Simulation failed", {
          description: errorMsg.slice(0, 100),
        });
      }
    }
  }, [commitSimError, pendingTxType]);

  // Handle reveal simulation errors
  useEffect(() => {
    if (revealSimError && pendingTxType === "reveal") {
      console.error("Reveal simulation error:", revealSimError);
      setLoading(false);
      setPendingTxType(null);
      setRevealArgs(null);

      const errorMsg = revealSimError.message || revealSimError.toString();

      if (errorMsg.includes("Invalid secret")) {
        toast.error("Wrong secret", {
          description: "The secret doesn't match your commitment.",
        });
      } else if (errorMsg.includes("Too early")) {
        toast.error("Too early to reveal", {
          description: "Wait at least 2 blocks after committing.",
        });
      } else if (
        errorMsg.includes("expired") ||
        errorMsg.includes("Commitment expired")
      ) {
        toast.error("Commitment expired", {
          description: "More than 250 blocks passed. Try again.",
        });
      } else if (errorMsg.includes("No commitment")) {
        toast.error("No commitment found", {
          description: "You need to commit first.",
        });
      } else if (errorMsg.includes("Not token owner")) {
        toast.error("Not token owner", {
          description: "You no longer own this NFT.",
        });
      } else {
        toast.error("Simulation failed", {
          description: errorMsg.slice(0, 100),
        });
      }
    }
  }, [revealSimError, pendingTxType]);

  // Handle write contract errors
  useEffect(() => {
    if (writeError) {
      console.error("Write contract error:", writeError);
      setLoading(false);
      setPendingTxType(null);

      const errorMessage = writeError.message || writeError.toString();

      if (errorMessage.includes("User rejected")) {
        toast.error("Transaction cancelled", {
          description: "You cancelled the transaction in your wallet.",
        });
      } else if (errorMessage.includes("insufficient funds")) {
        toast.error("Insufficient funds", {
          description:
            "You don't have enough SOMI to complete this transaction.",
        });
      } else if (errorMessage.includes("Invalid secret")) {
        toast.error("Wrong secret", {
          description: "The secret doesn't match your commitment.",
        });
      } else if (errorMessage.includes("Too early")) {
        toast.error("Too early to reveal", {
          description: "Wait at least 2 blocks after committing.",
        });
      } else if (
        errorMessage.includes("expired") ||
        errorMessage.includes("Commitment expired")
      ) {
        toast.error("Commitment expired", {
          description: "More than 250 blocks passed. Try again.",
        });
      } else if (errorMessage.includes("No commitment")) {
        toast.error("No commitment found", {
          description: "You need to commit first.",
        });
      } else if (errorMessage.includes("Not token owner")) {
        toast.error("Not token owner", {
          description: "You no longer own this NFT.",
        });
      } else {
        toast.error("Transaction failed", {
          description: errorMessage.slice(0, 100),
        });
      }
    }
  }, [writeError]);

  // Handle successful transaction submission
  useEffect(() => {
    if (hash && !writeError && pendingTxType) {
      if (pendingTxType === "commit") {
        toast.success("Commit transaction submitted", {
          description: "Your commitment is being processed on the blockchain.",
        });
        setMessage("Waiting for confirmation...");
      } else if (pendingTxType === "reveal") {
        toast.success("Reveal transaction submitted", {
          description: "Your reveal is being processed on the blockchain.",
        });
        setMessage("Waiting for reveal confirmation...");
      }
    }
  }, [hash, writeError, pendingTxType]);

  const loadUserNFTs = async () => {
    if (!address || !nftCollectionAddress || !window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const nftContract = new ethers.Contract(
        nftCollectionAddress,
        NFT_ABI,
        provider,
      );

      const balance = await nftContract.balanceOf(address);
      const tokens = [];

      for (let i = 0; i < Number(balance); i++) {
        const tokenId = await nftContract.tokenOfOwnerByIndex(address, i);
        tokens.push(Number(tokenId));
      }

      setUserNFTs(tokens);
    } catch (error) {
      console.error("Failed to load user NFTs:", error);
    }
  };

  const loadGameHistory = async (userAddress: string): Promise<void> => {
    try {
      const response = await api.get(`/slot/stats/${userAddress}`);
      const data = response.data;

      if (data.success) {
        setStats(data.stats);
        setGameHistory(data.recentGames);
      }
    } catch (err) {
      console.error("Failed to load game history:", err);
    }
  };

  const generateSecret = () => {
    const randomSecret = Math.floor(Math.random() * 1000000000).toString();
    setSecret(randomSecret);
  };

  const approveNFT = async (tokenId: number) => {
    if (!nftCollectionAddress || !window.ethereum) return false;

    try {
      setMessage("Checking NFT approval...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const nftContract = new ethers.Contract(
        nftCollectionAddress,
        NFT_ABI,
        signer,
      );

      const approved = await nftContract.getApproved(tokenId);
      if (approved.toLowerCase() === SLOT_MACHINE_CONTRACT.toLowerCase()) {
        return true;
      }

      setMessage("Approving NFT...");
      const tx = await nftContract.approve(SLOT_MACHINE_CONTRACT, tokenId);
      await tx.wait();

      toast.success("NFT approved", {
        description: "NFT approved for swapping.",
      });
      return true;
    } catch (error: unknown) {
      console.error("Approval failed:", error);
      toast.error("Approval failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
      return false;
    }
  };

  const handleCommit = async () => {
    if (!selectedGorilla || !secret) {
      toast.error("Missing information", {
        description: "Please select an NFT and generate a secret.",
      });
      return;
    }

    if (isNaN(Number(secret)) || secret.trim() === "") {
      toast.error("Invalid secret", {
        description: "Secret must be a number.",
      });
      return;
    }

    setLoading(true);

    try {
      const approved = await approveNFT(selectedGorilla.id);
      if (!approved) {
        setLoading(false);
        return;
      }

      setMessage("Submitting commitment...");
      setPendingTxType("commit");
      setSavedSecret(secret);

      if (typeof window !== "undefined") {
        const commitData = {
          secret: secret,
          tokenId: selectedGorilla.id,
          rarity: selectedRarity,
          timestamp: Date.now(),
        };
        sessionStorage.setItem(
          `slotmachine_commit_${address}`,
          JSON.stringify(commitData),
        );
      }

      writeContract({
        address: SLOT_MACHINE_CONTRACT,
        abi: SLOT_MACHINE_ABI,
        functionName: "commit",
        args: [BigInt(selectedGorilla.id), selectedRarity, BigInt(secret)],
        value: playFee as bigint,
      });
    } catch (error: unknown) {
      console.error("Commit error:", error);
      toast.error("Commit failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
      setLoading(false);
      setPendingTxType(null);
    }
  };

  const handleReveal = async () => {
    const revealSecret = secret || savedSecret;

    if (!revealSecret) {
      toast.error("Missing secret", {
        description: "Please enter your secret number.",
      });
      return;
    }

    if (isNaN(Number(revealSecret)) || revealSecret.trim() === "") {
      toast.error("Invalid secret", {
        description: "Secret must be a number.",
      });
      return;
    }

    if (!canReveal) {
      const blocksRemaining = Math.max(
        0,
        Number((commitment as { commitBlock?: bigint })?.commitBlock || 0) +
          2 -
          Number(currentBlock || 0),
      );
      toast.error("Too early to reveal", {
        description: `Wait ${blocksRemaining} more blocks.`,
      });
      return;
    }

    setLoading(true);
    setMessage("Simulating reveal...");
    setPendingTxType("reveal");

    try {
      setRevealArgs([BigInt(revealSecret)]);
    } catch (error: unknown) {
      console.error("Reveal error:", error);
      toast.error("Reveal failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
      setLoading(false);
      setPendingTxType(null);
    }
  };

  const processCommitConfirmation = () => {
    setMessage("Commitment confirmed! Wait 2+ blocks to reveal.");
    toast.success("Commitment confirmed!", {
      description: "Wait at least 2 blocks before revealing.",
    });
    setLoading(false);
    setStep("pending");
    refetchCommitment();
  };

  const processRevealConfirmation = () => {
    if (!receipt) return;

    try {
      const contractInterface = new ethers.Interface(SLOT_MACHINE_ABI);
      let revealData = null;

      for (const log of receipt.logs) {
        try {
          if (
            log.address.toLowerCase() === SLOT_MACHINE_CONTRACT.toLowerCase()
          ) {
            const parsedLog = contractInterface.parseLog({
              topics: log.topics,
              data: log.data,
            });

            if (parsedLog && parsedLog.name === "GameRevealed") {
              revealData = {
                deposited: Number(parsedLog.args.depositedTokenId),
                received: Number(parsedLog.args.receivedTokenId),
                rarity: Number(parsedLog.args.receivedRarity),
              };
              break;
            }
          }
        } catch {
          continue;
        }
      }

      if (revealData) {
        setLastResult(revealData);
        setSelectedDeposited(selectedGorilla);
        const receivedGorilla = gorillas.find(
          (g) => g.id === revealData.received,
        ) || { id: revealData.received, image: "/gorillas/g1.svg" };
        setSelectedReceived(receivedGorilla);
        setIsSuccessOpen(true);
        setMessage("Reveal successful!");
        toast.success("Swap complete!", {
          description: `You received NFT #${revealData.received}!`,
        });
      } else {
        setMessage("Reveal confirmed but couldn't parse result.");
        toast.success("Reveal confirmed!", {
          description: "Your NFT has been swapped.",
        });
      }
    } catch (error) {
      console.error("Error processing reveal:", error);
      toast.success("Reveal confirmed!", {
        description: "Your NFT has been swapped.",
      });
    }

    setSecret("");
    setSavedSecret("");
    setSelectedGorilla(null);
    setStep("initial");

    if (typeof window !== "undefined" && address) {
      sessionStorage.removeItem(`slotmachine_commit_${address}`);
    }

    setLoading(false);
    refetchCommitment();
    loadUserNFTs();
    if (address) loadGameHistory(address);
  };

  return (
    <>
      <section className="w-full flex gap-4 px-6 pb-6">
        {/* left content */}
        <div className="w-[35%] grid gap-4">
          <div className="border-2 border-translucent-light-4 bg-translucent-light-4 backdrop-blur-2xl p-4 grid gap-3 rounded-[20px]">
            <h1 className="text-h4 font-semibold text-light-primary">
              NFT slot machine
            </h1>
            <p className="text-translucent-light-80 text-body-2-medium font-normal">
              Pay the fee, pull the lever, and let the jungle decide your next
              Gorilla. You might score a legend—or get tricked by the jungle
              gods. Spin and find out.
            </p>
            <div className="grid grid-cols-2 w-full gap-3">
              <div className="w-full bg-translucent-light-4 border-2 border-translucent-light-4 rounded-[12px] px-4 py-3 grid gap-1">
                <p className="text-caption-1-medium text-translucent-light-64 font-medium">
                  Play fee
                </p>
                <h1 className="w-full text-body-2-medium font-medium text-light-primary">
                  {playFee ? ethers.formatEther(playFee as bigint) : "0.0001"}{" "}
                  SOMI
                </h1>
              </div>
              <div className="bg-translucent-light-4 border-2 border-translucent-light-4 rounded-[12px] px-4 py-3 grid gap-1">
                <p className="text-caption-1-medium text-translucent-light-64 font-medium">
                  Prize pool
                </p>
                <h1 className="text-body-2-medium font-medium text-light-primary">
                  {poolSize ? Number(poolSize) : 0} NFTs
                </h1>
              </div>
            </div>
          </div>
          <div className="border-2 border-translucent-light-4 bg-translucent-light-4 backdrop-blur-2xl p-4 grid gap-3 rounded-[20px]">
            <h1 className="text-h5 font-semibold text-light-primary">
              How to play
            </h1>
            <div className="grid gap-2 w-full">
              {[
                {
                  step: 1,
                  title: "Choose your Gorilla",
                  desc: "Choose one Some Gorillas NFT you want to swap.",
                },
                {
                  step: 2,
                  title: "Pay fee",
                  desc: "Pay the fee that is required to play slot machine.",
                },
                {
                  step: 3,
                  title: "Reveal your swapped NFT",
                  desc: "You must reveal your swapped NFT after paying fee.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="border-2 border-translucent-light-4 bg-translucent-light-4 p-3 rounded-[12px] flex gap-4"
                >
                  <div className="h-12 w-12 border-2 border-translucent-light-4 rounded-[8px] text-body-1-bold text-bold text-accent-yellow flex justify-center items-center">
                    {item.step}
                  </div>
                  <div className="grid gap-1 w-full">
                    <h1 className="text-body-2-medium font-medium text-light-primary">
                      {item.title}
                    </h1>
                    <p className="font-pally text-[14px] leading-5 font-normal text-translucent-light-64">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* History */}
          <div className="border-2 border-translucent-light-4 bg-translucent-light-4 backdrop-blur-2xl p-4 grid gap-3 rounded-[20px]">
            <h1 className="text-h5 font-semibold text-light-primary">
              History
            </h1>
            {/* You haven’t played yet section */}
            {/* <div className="h-[216px] border-2 border-translucent-light-4 bg-translucent-light-4 flex flex-col items-center justify-center gap-4 px-4 py-3 rounded-[12px]">
              <div className="h-[56px] w-[56px] p-4 border-2 border-translucent-light-4 bg-translucent-light-4 rounded-[12px]">
                <Image
                  src="/slot-machine/history.svg"
                  alt="slot machine history image"
                  height={24}
                  width={24}
                  className="w-6 h-6 object-cover"
                />
              </div>
              <p className="text-translucent-light-64 text-body-2-medium font-medium ">
                You haven’t played yet.
              </p>
            </div> */}
            {gameHistory.length > 0 ? (
              gameHistory.slice(0, 5).map((game) => (
                <div
                  key={game.id}
                  className="flex justify-between items-center w-full bg-translucent-light-4 border-2 border-translucent-light-4 p-3 rounded-[12px]"
                >
                  <div className="flex items-center gap-2">
                    <p className="text-caption-1-medium text-light-primary font-medium">
                      #{game.depositedTokenId} (
                      {RARITY_NAMES[
                        game.receivedRarity as keyof typeof RARITY_NAMES
                      ]?.charAt(0) || "B"}
                      )
                    </p>
                    <ArrowRight className="inline-block ml-2 mb-1 h-4 w-4 text-translucent-light-64" />
                    <p className="text-caption-1-medium text-light-primary font-medium">
                      #{game.receivedTokenId} (
                      {RARITY_NAMES[
                        game.receivedRarity as keyof typeof RARITY_NAMES
                      ]?.charAt(0) || "B"}
                      )
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-translucent-light-64 text-caption-1-medium font-medium">
                    <p>{new Date(game.createdAt).toLocaleDateString()}</p>
                    <Image
                      src="/slot-machine/explore.svg"
                      alt="explore icon"
                      width={16}
                      height={16}
                      className="object-cover"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="h-[60px] border-2 border-translucent-light-4 bg-translucent-light-4 flex flex-col items-center justify-center gap-4 px-4 py-3 rounded-[12px]">
                <p className="text-translucent-light-64 text-body-2-medium font-medium">
                  No games played yet.
                </p>
              </div>
            )}
            <div className="flex items-center w-full bg-translucent-light-4 border-2 border-translucent-light-4 p-3 rounded-[12px]">
              <div className="flex justify-between w-full items-center gap-2">
                <p className="text-body-2-medium text-translucent-light-64 font-medium">
                  Total played
                </p>
                <p className="text-body-2-medium text-light-primary font-medium">
                  {stats?.totalGames || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* right content */}
        <div className="w-[65%] border-2 border-translucent-light-4 bg-translucent-light-4 backdrop-blur-2xl p-4 flex flex-col gap-4 rounded-[20px]">
          <div className="bg-translucent-light-4 max-h-[392px] border-2 border-translucent-light-4 backdrop-blur-2xl px-4 pt-4 pb-6 grid gap-6 rounded-[16px]">
            <div className="flex justify-around items-center w-full gap-4">
              <div className="bg-translucent-light-4 flex items-center justify-center h-[280px] w-full border-2 border-translucent-light-4 backdrop-blur-2xl p-6 rounded-[12px]">
                {selectedGorilla ? (
                  <div className="flex flex-col items-center gap-2">
                    <Image
                      src={selectedGorilla.image}
                      alt="Selected Gorilla"
                      width={187}
                      height={187}
                      className="rounded-lg"
                    />
                    <p className="text-light-primary text-caption-1-medium font-medium">
                      Some Gorillas #{selectedGorilla.id}
                    </p>
                    <p className="text-accent-yellow text-cpation-2-medium font-medium">
                      Rarity B
                    </p>
                  </div>
                ) : (
                  <Button
                    className="h-12 rounded-[8px] bg-light-primary px-5 py-3 text-dark-primary hover:bg-light-primary text-button-48 font-semibold"
                    onClick={() => setDialogOpen(true)}
                  >
                    Choose your NFT
                  </Button>
                )}
              </div>

              <div className="w-6 h-6">
                <ArrowRight className="h-6 w-6 text-light-primary" />
              </div>

              <div className="bg-translucent-light-4 h-[280px] w-full flex items-center justify-center border-2 border-translucent-light-4 backdrop-blur-2xl p-6 rounded-[12px]">
                {hasCommitment ? (
                  <div className="flex items-center flex-col gap-3 w-full text-center">
                    <div className="border-2 border-translucent-light-4 bg-translucent-light-4 px-4 py-3 flex flex-col items-center justify-center w-full gap-4 rounded-[8px]">
                      <div className="h-[56px] w-[56px] p-4 border-2 border-translucent-light-4 bg-translucent-light-4 rounded-[12px]">
                        <Image
                          src="/slot-machine/hourglass.svg"
                          alt="slot machine hour image"
                          height={24}
                          width={24}
                          className="w-6 h-6 object-cover"
                        />
                      </div>
                      <p className="text-light-primary text-body-2-medium font-medium">
                        Pending Commitment...
                      </p>
                    </div>
                    <div className="flex justify-between w-full px-4 py-3 border-2 border-translucent-light-4 bg-translucent-light-4 rounded-[8px]">
                      <p className="text-caption-1-medium text-translucent-light-64 font-medium">
                        Committed block
                      </p>
                      <p className="text-caption-1-medium text-light-primary">
                        {commitment
                          ? Number(
                              (commitment as unknown as { commitBlock: bigint })
                                .commitBlock,
                            )
                          : 0}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 w-full gap-2">
                      <div className="flex justify-between w-full px-4 py-3 border-2 border-translucent-light-4 bg-translucent-light-4 rounded-[8px]">
                        <p className="text-caption-1-medium text-translucent-light-64 font-medium">
                          Token ID
                        </p>
                        <p className="text-caption-1-medium text-light-primary">
                          #
                          {commitment
                            ? Number(
                                (
                                  commitment as unknown as {
                                    depositTokenId: bigint;
                                  }
                                ).depositTokenId,
                              )
                            : selectedGorilla?.id}
                        </p>
                      </div>
                      <div className="flex justify-between w-full px-4 py-3 border-2 border-translucent-light-4 bg-translucent-light-4 rounded-[8px]">
                        <p className="text-caption-1-medium text-translucent-light-64 font-medium">
                          Rarity
                        </p>
                        <p className="text-caption-1-medium text-light-primary">
                          {commitment
                            ? RARITY_NAMES[
                                Number(
                                  (
                                    commitment as unknown as {
                                      depositRarity: bigint;
                                    }
                                  ).depositRarity,
                                ) as keyof typeof RARITY_NAMES
                              ]?.charAt(0) || "B"
                            : "B"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 h-[96px] w-[96px] border-translucent-light-4 rounded-[12px] bg-translucent-light-4 p-6 flex justify-center items-center">
                    <Image
                      src="/slot-machine/gorilla.svg"
                      alt="stake image"
                      height={48}
                      width={48}
                      className="w-12 h-12 object-cover drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-center gap-3">
              {hasCommitment ? (
                <>
                  <Button
                    className="h-12 rounded-[8px] cursor-pointer bg-transparent border-2 text-light-primary border-translucent-light-4 px-5 py-3  text-button-48 font-semibold hover:bg-translucent-light-4"
                    onClick={() => {
                      setStep("initial");
                      setSelectedGorilla(null);
                      setSecret("");
                      setSavedSecret("");
                    }}
                  >
                    <p className="text-translucent-light-64">Cancel</p>
                  </Button>
                  <Button
                    onClick={handleReveal}
                    disabled={
                      !canReveal ||
                      loading ||
                      isWritePending ||
                      (!secret && !savedSecret)
                    }
                    className={`h-12 cursor-pointer rounded-[8px] px-5 py-3 text-button-48 font-semibold transition-all duration-300 ${
                      canReveal &&
                      (secret || savedSecret) &&
                      !loading &&
                      !isWritePending
                        ? "bg-light-primary text-dark-primary hover:bg-light-primary"
                        : "bg-translucent-light-4 text-translucent-light-64 cursor-not-allowed"
                    }`}
                  >
                    {revealArgs && !isWritePending
                      ? "Simulating..."
                      : isWritePending && pendingTxType === "reveal"
                        ? "Waiting..."
                        : !canReveal
                          ? `Wait ${Math.max(0, Number((commitment as unknown as { commitBlock: bigint })?.commitBlock || 0) + 2 - Number(currentBlock || 0))} blocks`
                          : "Reveal NFT"}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleCommit}
                  disabled={
                    !isPayButtonEnabled ||
                    !selectedGorilla ||
                    !secret ||
                    loading ||
                    isWritePending
                  }
                  className={`h-12 rounded-[8px] border-2 px-5 py-3 text-button-48 font-semibold transition-all duration-300 ${
                    isPayButtonEnabled &&
                    selectedGorilla &&
                    secret &&
                    !loading &&
                    !isWritePending
                      ? "bg-light-primary text-dark-primary hover:bg-light-primary border-light-primary cursor-pointer"
                      : "bg-translucent-light-4 text-translucent-light-64 border-translucent-light-4 cursor-not-allowed"
                  }`}
                >
                  {loading || isWritePending
                    ? "Processing..."
                    : `Pay fee - ${playFee ? ethers.formatEther(playFee as bigint) : "0.0001"} SOMI`}
                </Button>
              )}
            </div>
          </div>
          <div className="border-[2px] h-[448px] border-translucent-light-4 bg-translucent-light-4 rounded-2xl overflow-hidden mt-4">
            <div className="flex justify-between items-center p-4">
              <h1 className="text-h5 font-semibold text-light-primary">
                NFT Pool
              </h1>
              <div className="border-2 border-translucent-light-4 px-3 py-2 rounded-[8px] flex gap-2">
                <p className="text-caption-1-medium text-translucent-light-64 font-medium">
                  Pool size
                </p>
                <p className="text-light-primary text-caption-1-medium font-medium">
                  {poolSize ? Number(poolSize) : 0} NFTs
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-4 max-h-[364px] overflow-y-auto">
              {!isConnected ? (
                <div className="col-span-full flex flex-col items-center justify-center p-8 text-center">
                  <p className="text-translucent-light-64 text-body-2-medium font-medium">
                    Connect your wallet to see your NFTs
                  </p>
                </div>
              ) : userNFTs.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center p-8 text-center">
                  <p className="text-translucent-light-64 text-body-2-medium font-medium">
                    No NFTs found in your wallet
                  </p>
                </div>
              ) : (
                userNFTs.map((tokenId) => {
                  const gorillaData = gorillas.find(
                    (g) => g.id === tokenId,
                  ) || { id: tokenId, image: "/gorillas/g1.svg" };
                  return (
                    <div
                      key={tokenId}
                      onClick={() =>
                        !hasCommitment && setSelectedGorilla(gorillaData)
                      }
                      className={`relative rounded-xl p-3 border-[2px] h-fit w-full transition-all duration-200 ${
                        hasCommitment
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer"
                      } ${
                        selectedGorilla?.id === tokenId
                          ? "border-white bg-white"
                          : "border-translucent-light-4 bg-translucent-light-4"
                      }`}
                    >
                      <div className="relative overflow-hidden rounded-lg">
                        <Image
                          src={gorillaData.image}
                          alt={`Gorilla #${tokenId}`}
                          width={138}
                          height={138}
                          className="object-cover w-full h-auto aspect-square"
                        />
                      </div>
                      <div className="flex flex-col gap-1 text-center mt-2">
                        <span
                          className={`text-caption-1-medium font-medium ${
                            selectedGorilla?.id === tokenId
                              ? "text-dark-primary"
                              : "text-light-primary"
                          }`}
                        >
                          #{tokenId}
                        </span>
                        <span
                          className={`text-caption-2-medium font-medium ${
                            selectedGorilla?.id === tokenId
                              ? "text-dark-primary"
                              : "text-accent-yellow"
                          }`}
                        >
                          Rarity B
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Secret Input for Reveal */}
      {hasCommitment && (!savedSecret || !secret) && (
        <div className="fixed bottom-4 right-4 bg-translucent-light-4 border-2 border-translucent-light-4 backdrop-blur-2xl p-4 rounded-[16px] max-w-sm">
          <h3 className="text-light-primary text-body-2-medium font-medium mb-2">
            Enter Your Secret
          </h3>
          <p className="text-translucent-light-64 text-caption-1-medium mb-3">
            Enter the secret you used when committing to reveal your NFT.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter secret number"
              className="flex-1 bg-white/20 px-3 py-2 rounded-lg text-white placeholder-white/60 text-sm"
              disabled={loading}
            />
          </div>
        </div>
      )}

      {/* Status Message */}
      {message && (
        <div className="fixed top-4 right-4 bg-translucent-light-4 border-2 border-translucent-light-4 backdrop-blur-2xl p-4 rounded-[16px] max-w-sm">
          <p className="text-light-primary text-caption-1-medium">{message}</p>
        </div>
      )}

      {/* Loading Overlay */}
      {(loading || isWritePending) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-translucent-light-4 backdrop-blur-lg p-8 rounded-lg border-2 border-translucent-light-4">
            <div className="w-12 h-12 border-4 border-accent-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-center text-light-primary">
              {commitArgs && !isWritePending
                ? "Simulating commit..."
                : revealArgs && !isWritePending
                  ? "Simulating reveal..."
                  : isWritePending
                    ? "Waiting for wallet..."
                    : "Processing..."}
            </p>
          </div>
        </div>
      )}

      <SelectGorillaDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleConfirm}
        gorillas={userNFTs.map(
          (id) =>
            gorillas.find((g) => g.id === id) || {
              id,
              image: "/gorillas/g1.svg",
            },
        )}
      />
      <SuccessDialog
        open={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        deposited={selectedDeposited}
        received={selectedReceived}
        setStep={() => setStep("initial")}
        setSelectedGorilla={setSelectedGorilla}
      />
    </>
  );
}
