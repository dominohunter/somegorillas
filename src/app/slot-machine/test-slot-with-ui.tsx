"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
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
import axiosClient from "@/lib/axios";
import { NFT_ABI, SLOT_MACHINE_ABI } from "@/lib/config";
import { Button } from "@/components/ui/button";
import SelectGorillaDialog from "@/components/slot-machine/selectGorillaDialog";

// Contract configuration
const CONTRACT_ADDRESS = "0x549bD51F0E53Ad1B7c4A1aECD71000462adcda09";

const RARITY_NAMES = {
  1: "S (Rarest)",
  2: "A",
  3: "B",
  4: "C",
  5: "D (Common)",
};

const RARITY_COLORS = {
  1: "from-purple-500 to-pink-500",
  2: "from-blue-500 to-cyan-500",
  3: "from-green-500 to-emerald-500",
  4: "from-yellow-500 to-orange-500",
  5: "from-gray-400 to-gray-500",
};

interface Gorilla {
  id: number;
  image: string;
}

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
  const [selectedRarity, setSelectedRarity] = useState(3);
  const [secret, setSecret] = useState("");
  const [savedSecret, setSavedSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [lastResult, setLastResult] = useState(null);
  const [pendingTxType, setPendingTxType] = useState(null);
  const [userNFTs, setUserNFTs] = useState([]);
  const [nftCollectionAddress, setNftCollectionAddress] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [step, setStep] = useState<"initial" | "pending">("initial");
  const [isPayButtonEnabled, setIsPayButtonEnabled] = useState(false);

  // Simulation states
  const [commitArgs, setCommitArgs] = useState(null);
  const [revealArgs, setRevealArgs] = useState(null);
  const [cancelRequested, setCancelRequested] = useState(false);

  const [gameHistory, setGameHistory] = useState([]);
  const [stats, setStats] = useState(null);

  // Simulate commit transaction
  const { data: commitSimulation, error: commitSimError } = useSimulateContract(
    {
      address: CONTRACT_ADDRESS,
      abi: SLOT_MACHINE_ABI,
      functionName: "commit",
      args: commitArgs?.args,
      value: commitArgs?.value,
      query: {
        enabled: !!commitArgs,
      },
    },
  );

  // Simulate reveal transaction
  const { data: revealSimulation, error: revealSimError } = useSimulateContract(
    {
      address: CONTRACT_ADDRESS,
      abi: SLOT_MACHINE_ABI,
      functionName: "reveal",
      args: revealArgs,
      query: {
        enabled: !!revealArgs,
      },
    },
  );

  // Simulate cancel transaction
  const { data: cancelSimulation, error: cancelSimError } = useSimulateContract(
    {
      address: CONTRACT_ADDRESS,
      abi: SLOT_MACHINE_ABI,
      functionName: "cancelCommitment",
      query: {
        enabled: cancelRequested,
      },
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
    address: CONTRACT_ADDRESS,
    abi: SLOT_MACHINE_ABI,
    functionName: "playFee",
  });

  const { data: poolSize } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SLOT_MACHINE_ABI,
    functionName: "getPoolSize",
  });

  const { data: nftCollection } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SLOT_MACHINE_ABI,
    functionName: "nftCollection",
  });

  const { data: commitment, refetch: refetchCommitment } = useReadContract({
    address: CONTRACT_ADDRESS,
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
  
  useEffect(() => {
    if (selectedGorilla && step === "initial") {
      const timer = setTimeout(() => setIsPayButtonEnabled(true), 3000);
      return () => clearTimeout(timer);
    } else {
      setIsPayButtonEnabled(false);
    }
  }, [selectedGorilla, step]);

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Set NFT collection address when loaded
  useEffect(() => {
    if (nftCollection) {
      setNftCollectionAddress(nftCollection);
    }
  }, [nftCollection]);

  // Load user NFTs when connected
  useEffect(() => {
    if (isConnected && address && nftCollectionAddress && isClient) {
      loadUserNFTs();
    }
  }, [isConnected, address, nftCollectionAddress, isClient]);

  // Handle commit simulation result
  useEffect(() => {
    if (commitSimulation && !commitSimError && pendingTxType === "commit") {
      writeContract(commitSimulation.request);
      setCommitArgs(null);
    }
  }, [commitSimulation, commitSimError, pendingTxType]);

  // Handle commit simulation error
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

  // Handle reveal simulation result
  useEffect(() => {
    if (revealSimulation && !revealSimError && pendingTxType === "reveal") {
      writeContract(revealSimulation.request);
      setRevealArgs(null);
    }
  }, [revealSimulation, revealSimError, pendingTxType]);

  useEffect(() => {
    if (isConnected && address) {
      loadGameHistory(address);
    }
  }, [isConnected, address]);

  // Handle reveal simulation error
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
          description: "More than 250 blocks passed. Cancel and try again.",
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

  // Handle cancel simulation result
  useEffect(() => {
    if (cancelSimulation && !cancelSimError && pendingTxType === "cancel") {
      writeContract(cancelSimulation.request);
      setCancelRequested(false);
    }
  }, [cancelSimulation, cancelSimError, pendingTxType]);

  // Handle cancel simulation error
  useEffect(() => {
    if (cancelSimError && pendingTxType === "cancel") {
      console.error("Cancel simulation error:", cancelSimError);
      setLoading(false);
      setPendingTxType(null);
      setCancelRequested(false);

      const errorMsg = cancelSimError.message || cancelSimError.toString();

      if (errorMsg.includes("No commitment")) {
        toast.error("No commitment found", {
          description: "You don't have a commitment to cancel.",
        });
      } else if (errorMsg.includes("Not expired")) {
        toast.error("Not expired yet", {
          description: "Commitment must be expired (250+ blocks) to cancel.",
        });
      } else {
        toast.error("Simulation failed", {
          description: errorMsg.slice(0, 100),
        });
      }
    }
  }, [cancelSimError, pendingTxType]);

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
            "You don't have enough ETH to complete this transaction.",
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
          description: "More than 250 blocks passed. Cancel and try again.",
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
      } else if (pendingTxType === "cancel") {
        toast.success("Cancel transaction submitted", {
          description: "Cancelling your commitment.",
        });
        setMessage("Waiting for cancellation confirmation...");
      }
    }
  }, [hash, writeError, pendingTxType]);

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && receipt && hash && pendingTxType) {
      if (pendingTxType === "commit") {
        processCommitConfirmation();
      } else if (pendingTxType === "reveal") {
        processRevealConfirmation();
      } else if (pendingTxType === "cancel") {
        processCancelConfirmation();
      }
      setPendingTxType(null);
    }
  }, [isConfirmed, receipt, hash, pendingTxType]);

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
      const response = await axiosClient.get(`/slot/stats/${userAddress}`);
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

  const approveNFT = async (tokenId) => {
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
      if (approved.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()) {
        return true;
      }

      setMessage("Approving NFT...");
      const tx = await nftContract.approve(CONTRACT_ADDRESS, tokenId);
      await tx.wait();

      toast.success("NFT approved", {
        description: "NFT approved for swapping.",
      });
      return true;
    } catch (error) {
      console.error("Approval failed:", error);
      toast.error("Approval failed", {
        description: error.message,
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

    if (isNaN(secret) || secret.trim() === "") {
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
        address: CONTRACT_ADDRESS,
        abi: SLOT_MACHINE_ABI,
        functionName: "commit",
        args: [BigInt(selectedGorilla.id), selectedRarity, BigInt(secret)],
        value: playFee,
      });
    } catch (error) {
      console.error("Commit error:", error);
      toast.error("Commit failed", {
        description: error.message,
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

    if (isNaN(revealSecret) || revealSecret.trim() === "") {
      toast.error("Invalid secret", {
        description: "Secret must be a number.",
      });
      return;
    }

    if (!canReveal) {
      const blocksRemaining = Math.max(
        0,
        Number(commitment.commitBlock) + 2 - Number(currentBlock),
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
    } catch (error) {
      console.error("Reveal error:", error);
      toast.error("Reveal failed", {
        description: error.message,
      });
      setLoading(false);
      setPendingTxType(null);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    setMessage("Simulating cancellation...");
    setPendingTxType("cancel");
    setCancelRequested(true);
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
          if (log.address.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()) {
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
        } catch (parseError) {
          continue;
        }
      }

      if (revealData) {
        setLastResult(revealData);
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
    loadGameHistory(address?.toString());
  };

  const processCancelConfirmation = () => {
    setMessage("Commitment cancelled and fee refunded.");
    toast.success("Commitment cancelled", {
      description: "Your fee has been refunded.",
    });

    setSecret("");
    setSavedSecret("");
    setSelectedGorilla(null);
    setStep("initial");

    if (typeof window !== "undefined" && address) {
      sessionStorage.removeItem(`slotmachine_commit_${address}`);
    }

    setLoading(false);
    refetchCommitment();
  };

  const hasCommitment = commitment && Number(commitment.commitBlock) > 0;

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
            console.log("Loaded saved secret from session storage");
          } catch (e) {
            console.error("Failed to parse stored commit data:", e);
          }
        }
      }
    }
  }, [isConnected, address, hasCommitment, savedSecret]);
  
  const canReveal =
    hasCommitment &&
    currentBlock &&
    Number(currentBlock) >= Number(commitment.commitBlock) + 2;
  const canCancel =
    hasCommitment &&
    currentBlock &&
    Number(currentBlock) > Number(commitment.commitBlock) + 250;

  if (!isClient) {
    return <div>Loading...</div>;
  }

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
                  {playFee ? ethers.formatEther(playFee) : "0"} ETH
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
              <>
                {gameHistory.slice(0, 3).map((game) => (
                  <div key={game.id} className="flex justify-between items-center w-full bg-translucent-light-4 border-2 border-translucent-light-4 p-3 rounded-[12px]">
                    <div className="flex items-center gap-2">
                      <p className="text-caption-1-medium text-light-primary font-medium">
                        #{game.depositedTokenId} (Tier {RARITY_NAMES[game.depositRarity]?.charAt(0) || 'D'})
                      </p>
                      <ArrowRight className="inline-block ml-2 mb-1 h-4 w-4 text-translucent-light-64" />
                      <p className="text-caption-1-medium text-light-primary font-medium">
                        #{game.receivedTokenId} (Tier {RARITY_NAMES[game.receivedRarity]?.charAt(0) || 'D'})
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
                ))}
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
              </>
            ) : (
              <div className="h-[216px] border-2 border-translucent-light-4 bg-translucent-light-4 flex flex-col items-center justify-center gap-4 px-4 py-3 rounded-[12px]">
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
                  You haven't played yet.
                </p>
              </div>
            )}
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
                  {!isConnected ? (
                    <div className="text-center">
                      <p className="text-translucent-light-64 text-body-2-medium font-medium mb-4">
                        Connect wallet to play
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
                )}
              </div>

              <div className="w-6 h-6">
                <ArrowRight className="h-6 w-6 text-light-primary" />
              </div>

              <div className="bg-translucent-light-4 h-[280px] w-full flex items-center justify-center border-2 border-translucent-light-4 backdrop-blur-2xl p-6 rounded-[12px]">
                {(step === "pending" || hasCommitment) ? (
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
                        {hasCommitment ? Number(commitment.commitBlock) : 'N/A'}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 w-full gap-2">
                      <div className="flex justify-between w-full px-4 py-3 border-2 border-translucent-light-4 bg-translucent-light-4 rounded-[8px]">
                        <p className="text-caption-1-medium text-translucent-light-64 font-medium">
                          Token ID
                        </p>
                        <p className="text-caption-1-medium text-light-primary">
                          #{hasCommitment ? Number(commitment.depositTokenId) : selectedGorilla?.id}
                        </p>
                      </div>
                      <div className="flex justify-between w-full px-4 py-3 border-2 border-translucent-light-4 bg-translucent-light-4 rounded-[8px]">
                        <p className="text-caption-1-medium text-translucent-light-64 font-medium">
                          Rarity
                        </p>
                        <p className="text-caption-1-medium text-light-primary">
                          {hasCommitment ? RARITY_NAMES[Number(commitment.depositRarity)]?.charAt(0) || 'B' : 'B'}
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
              {!isConnected ? (
                <p className="text-translucent-light-64 text-body-2-medium font-medium">
                  Connect your wallet to play
                </p>
              ) : (step === "pending" || hasCommitment) ? (
                <>
                  {canCancel && (
                    <Button
                      className="h-12 rounded-[8px] cursor-pointer bg-transparent border-2 text-light-primary border-translucent-light-4 px-5 py-3  text-button-48 font-semibold hover:bg-translucent-light-4"
                      onClick={handleCancel}
                      disabled={loading || isWritePending}
                    >
                      <p className="text-translucent-light-64">
                        {cancelRequested && !isWritePending
                          ? "Simulating..."
                          : isWritePending && pendingTxType === "cancel"
                            ? "Waiting..."
                            : "Cancel"}
                      </p>
                    </Button>
                  )}
                  <div className="flex flex-col gap-2">
                    {!savedSecret && !secret && (
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={secret}
                          onChange={(e) => setSecret(e.target.value)}
                          placeholder="Enter your secret"
                          className="flex-1 bg-white/20 px-2 py-1 rounded text-dark-primary placeholder:text-gray-600 text-sm"
                          disabled={loading}
                        />
                        <button
                          onClick={generateSecret}
                          disabled={loading}
                          className="bg-white/20 px-2 py-1 rounded hover:bg-white/30 transition disabled:opacity-50 text-sm"
                        >
                          Generate
                        </button>
                      </div>
                    )}
                    <Button 
                      className="h-12 cursor-pointer rounded-[8px] bg-light-primary px-5 py-3 text-dark-primary text-button-48 font-semibold hover:bg-light-primary"
                      onClick={handleReveal}
                      disabled={
                        !canReveal ||
                        loading ||
                        (!secret && !savedSecret) ||
                        isWritePending
                      }
                    >
                      {revealArgs && !isWritePending
                        ? "Simulating..."
                        : isWritePending && pendingTxType === "reveal"
                          ? "Waiting..."
                          : canReveal
                            ? "Reveal NFT"
                            : `Wait ${Math.max(
                                0,
                                Number(commitment?.commitBlock || 0) + 2 - Number(currentBlock || 0)
                              )} blocks`}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-2 w-full">
                  {selectedGorilla && (
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={secret}
                        onChange={(e) => setSecret(e.target.value)}
                        placeholder="Enter or generate secret"
                        className="flex-1 bg-white/20 px-2 py-1 rounded text-dark-primary placeholder:text-gray-600 text-sm"
                        disabled={loading}
                      />
                      <button
                        onClick={generateSecret}
                        disabled={loading}
                        className="bg-white/20 px-2 py-1 rounded hover:bg-white/30 transition disabled:opacity-50 text-sm"
                      >
                        Generate
                      </button>
                    </div>
                  )}
                  <Button
                    disabled={!selectedGorilla || !secret || loading || isWritePending}
                    className={`h-12 rounded-[8px] border-2 px-5 py-3 text-button-48 font-semibold transition-all duration-300 ${
                      selectedGorilla && secret && !loading && !isWritePending
                        ? "bg-light-primary text-dark-primary hover:bg-light-primary border-light-primary cursor-pointer"
                        : "bg-translucent-light-4 text-translucent-light-64 border-translucent-light-4 cursor-not-allowed"
                    }`}
                    onClick={handleCommit}
                  >
                    {commitArgs && !isWritePending
                      ? "Simulating..."
                      : isWritePending && pendingTxType === "commit"
                        ? "Waiting for wallet..."
                        : loading
                          ? "Processing..."
                          : `Pay fee - ${playFee ? ethers.formatEther(playFee) : "0"} ETH`}
                  </Button>
                </div>
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
              {userNFTs.length > 0 ? userNFTs.map((tokenId) => {
                const gorillaImage = gorillas.find(g => g.id === tokenId)?.image || "/gorillas/g1.svg";
                return (
                  <div
                    key={tokenId}
                    onClick={() => setSelectedGorilla({ id: tokenId, image: gorillaImage })}
                    className={`relative rounded-xl p-3 border-[2px] h-fit w-full transition-all duration-200 cursor-pointer ${
                      selectedGorilla?.id === tokenId
                        ? "border-white bg-white"
                        : "border-translucent-light-4 bg-translucent-light-4"
                    }`}
                  >
                    <div className="relative overflow-hidden rounded-lg">
                      <Image
                        src={gorillaImage}
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
              }) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-translucent-light-64 text-body-2-medium font-medium">
                    {isConnected ? "You don't own any NFTs in this collection" : "Connect wallet to see your NFTs"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <SelectGorillaDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleConfirm}
        gorillas={userNFTs.map(tokenId => ({
          id: tokenId,
          image: gorillas.find(g => g.id === tokenId)?.image || "/gorillas/g1.svg"
        }))}
      />
      
      {/* Last Result */}
      {lastResult && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-center text-white">🎉 Swap Complete!</h2>
            <div className="grid grid-cols-2 gap-4 text-center mb-6">
              <div className="bg-white/10 p-4 rounded-lg">
                <p className="opacity-70 text-sm mb-2 text-white">You Deposited</p>
                <p className="text-3xl font-bold text-white">#{lastResult.deposited}</p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                <p className="opacity-90 text-sm mb-2 text-white">You Received</p>
                <p className="text-3xl font-bold text-white">#{lastResult.received}</p>
                <p className="text-sm mt-1 text-white">
                  {RARITY_NAMES[lastResult.rarity]}
                </p>
              </div>
            </div>
            <button
              onClick={() => setLastResult(null)}
              className="w-full bg-light-primary text-dark-primary px-4 py-2 rounded-lg hover:bg-light-primary/90 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {(loading || isWritePending) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-lg">
            <div className="w-12 h-12 border-4 border-light-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-center text-white">
              {commitArgs && !isWritePending
                ? "Simulating commit..."
                : revealArgs && !isWritePending
                  ? "Simulating reveal..."
                  : cancelRequested && !isWritePending
                    ? "Simulating cancel..."
                    : isWritePending
                      ? "Waiting for wallet..."
                      : "Processing..."}
            </p>
          </div>
        </div>
      )}

      {/* Status Message */}
      {message && (
        <div className="fixed bottom-4 right-4 z-40">
          <div
            className={`rounded-lg p-4 max-w-sm ${
              message.includes("failed") || message.includes("Failed")
                ? "bg-red-500/20 border-2 border-red-400"
                : message.includes("successful") ||
                    message.includes("confirmed")
                  ? "bg-green-500/20 border-2 border-green-400"
                  : "bg-blue-500/20 border-2 border-blue-400"
            }`}
          >
            <p className="text-white text-sm">{message}</p>
          </div>
        </div>
      )}
    </>
  );
}
