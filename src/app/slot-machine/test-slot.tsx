//User closes browser after commit
// User switches devices
// Transaction fails silently
// User refreshes during reveal
"use client";

import React, { useState, useEffect } from "react";
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

export default function SlotMachineApp() {
  const { address, isConnected } = useAccount();
  const { data: currentBlock } = useBlockNumber({ watch: true });

  // UI state
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [selectedRarity, setSelectedRarity] = useState(3);
  const [secret, setSecret] = useState("");
  const [savedSecret, setSavedSecret] = useState(""); // Store committed secret
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [lastResult, setLastResult] = useState(null);
  const [pendingTxType, setPendingTxType] = useState(null);
  const [userNFTs, setUserNFTs] = useState([]);
  const [nftCollectionAddress, setNftCollectionAddress] = useState(null);
  const [isClient, setIsClient] = useState(false);

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
      // Simulation successful, proceed with write
      writeContract(commitSimulation.request);
      setCommitArgs(null); // Clear simulation args
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
      // Simulation successful, proceed with write
      writeContract(revealSimulation.request);
      setRevealArgs(null); // Clear simulation args
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
      // Simulation successful, proceed with write
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
    if (!selectedNFT || !secret) {
      toast.error("Missing information", {
        description: "Please select an NFT and generate a secret.",
      });
      return;
    }

    // Validate secret is a number
    if (isNaN(secret) || secret.trim() === "") {
      toast.error("Invalid secret", {
        description: "Secret must be a number.",
      });
      return;
    }

    setLoading(true);

    try {
      const approved = await approveNFT(selectedNFT);
      if (!approved) {
        setLoading(false);
        return;
      }

      setMessage("Submitting commitment...");
      setPendingTxType("commit");

      // Save the secret for reveal
      setSavedSecret(secret);

      // Store in localStorage as backup
      if (typeof window !== "undefined") {
        const commitData = {
          secret: secret,
          tokenId: selectedNFT,
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
        args: [BigInt(selectedNFT), selectedRarity, BigInt(secret)],
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

    // Validate secret is a number
    if (isNaN(revealSecret) || revealSecret.trim() === "") {
      toast.error("Invalid secret", {
        description: "Secret must be a number.",
      });
      return;
    }

    // Check timing
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
      // Set args for simulation
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

    // Clear saved secret
    setSecret("");
    setSavedSecret("");
    setSelectedNFT(null);

    // Clear from sessionStorage
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

    // Clear saved secret
    setSecret("");
    setSavedSecret("");
    setSelectedNFT(null);

    // Clear from sessionStorage
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

  const ConnectionStatus = () => {
    if (!isClient) return null;

    if (!isConnected) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="text-yellow-800 font-semibold">Wallet Required</h3>
          <p className="text-yellow-700 text-sm">
            Please connect your wallet to start playing.
          </p>
        </div>
      );
    }

    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <h3 className="text-green-800 font-semibold">Wallet Connected</h3>
        <p className="text-green-700 text-sm font-mono">{address}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          🎰 NFT Slot Machine
        </h1>

        <ConnectionStatus />

        {isConnected && (
          <>
            {/* Contract Info */}
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="opacity-70 block">Play Fee</span>
                  <p className="font-bold">
                    {playFee ? ethers.formatEther(playFee) : "0"} ETH
                  </p>
                </div>
                <div>
                  <span className="opacity-70 block">Pool Size</span>
                  <p className="font-bold">
                    {poolSize ? Number(poolSize) : 0} NFTs
                  </p>
                </div>
                <div>
                  <span className="opacity-70 block">Your NFTs</span>
                  <p className="font-bold">{userNFTs.length}</p>
                </div>
                <div>
                  <span className="opacity-70 block">Current Block</span>
                  <p className="font-bold">
                    {currentBlock ? Number(currentBlock) : 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Commitment Status */}
            {hasCommitment && (
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">
                  ⏳ Pending Commitment
                </h2>
                <div className="space-y-2 text-sm">
                  <p>
                    Token ID:{" "}
                    <span className="font-bold">
                      #{Number(commitment.depositTokenId)}
                    </span>
                  </p>
                  <p>
                    Rarity:{" "}
                    <span className="font-bold">
                      {RARITY_NAMES[Number(commitment.depositRarity)]}
                    </span>
                  </p>
                  <p>
                    Committed at block:{" "}
                    <span className="font-bold">
                      {Number(commitment.commitBlock)}
                    </span>
                  </p>
                  <p>
                    Current block:{" "}
                    <span className="font-bold">{Number(currentBlock)}</span>
                  </p>
                  <p className="text-lg mt-2">
                    {canReveal ? (
                      <span className="text-green-400">✓ Ready to reveal!</span>
                    ) : (
                      <span className="text-yellow-400">
                        Wait{" "}
                        {Math.max(
                          0,
                          Number(commitment.commitBlock) +
                            2 -
                            Number(currentBlock),
                        )}{" "}
                        more blocks
                      </span>
                    )}
                  </p>
                </div>

                {!savedSecret && !secret && (
                  <div className="mt-4 p-3 bg-yellow-500/20 border-2 border-yellow-400 rounded-lg">
                    <p className="text-yellow-200 text-sm">
                      ⚠️ <strong>Warning:</strong> No saved secret found! You
                      must enter the exact secret you used when committing.
                    </p>
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  <input
                    type="text"
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    placeholder={
                      savedSecret
                        ? `Secret loaded (${savedSecret})`
                        : "Enter your secret"
                    }
                    className="flex-1 bg-white/20 px-4 py-2 rounded-lg text-white placeholder-white/60"
                    disabled={loading}
                  />
                  <button
                    onClick={handleReveal}
                    disabled={
                      !canReveal ||
                      loading ||
                      (!secret && !savedSecret) ||
                      isWritePending
                    }
                    className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition"
                  >
                    {revealArgs && !isWritePending
                      ? "Simulating..."
                      : isWritePending && pendingTxType === "reveal"
                        ? "Waiting..."
                        : "Reveal"}
                  </button>
                  {canCancel && (
                    <button
                      onClick={handleCancel}
                      disabled={loading || isWritePending}
                      className="bg-gradient-to-r from-red-500 to-rose-500 px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                    >
                      {cancelRequested && !isWritePending
                        ? "Simulating..."
                        : isWritePending && pendingTxType === "cancel"
                          ? "Waiting..."
                          : "Cancel"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Play Section */}
            {!hasCommitment && (
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">🎮 Swap Your NFT</h2>

                {userNFTs.length === 0 ? (
                  <p className="text-center opacity-70">
                    You don't have any NFTs in this collection
                  </p>
                ) : (
                  <>
                    {/* NFT Selection */}
                    <div className="mb-4">
                      <label className="block mb-2 font-semibold">
                        Select NFT to Swap:
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {userNFTs.map((tokenId) => (
                          <button
                            key={tokenId}
                            onClick={() => setSelectedNFT(tokenId)}
                            disabled={loading}
                            className={`p-3 rounded-lg border-2 transition ${
                              selectedNFT === tokenId
                                ? "border-purple-400 bg-purple-500/30"
                                : "border-white/20 bg-white/5 hover:border-white/40"
                            } disabled:opacity-50`}
                          >
                            #{tokenId}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Rarity Selection */}
                    <div className="mb-4">
                      <label className="block mb-2 font-semibold">
                        Select Rarity:
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {[1, 2, 3, 4, 5].map((rarity) => (
                          <button
                            key={rarity}
                            onClick={() => setSelectedRarity(rarity)}
                            disabled={loading}
                            className={`p-3 rounded-lg border-2 transition text-sm ${
                              selectedRarity === rarity
                                ? `border-white bg-gradient-to-r ${RARITY_COLORS[rarity]}`
                                : "border-white/20 bg-white/5 hover:border-white/40"
                            } disabled:opacity-50`}
                          >
                            {RARITY_NAMES[rarity]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Secret Generation */}
                    <div className="mb-4">
                      <label className="block mb-2 font-semibold">
                        Secret (SAVE THIS!):
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={secret}
                          onChange={(e) => setSecret(e.target.value)}
                          placeholder="Generate or enter a secret number"
                          className="flex-1 bg-white/20 px-4 py-2 rounded-lg text-white placeholder-white/60"
                          disabled={loading}
                        />
                        <button
                          onClick={generateSecret}
                          disabled={loading}
                          className="bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition disabled:opacity-50"
                        >
                          Generate
                        </button>
                      </div>
                      <div className="mt-2 p-2 bg-red-500/20 border border-red-400 rounded">
                        <p className="text-xs text-red-200">
                          ⚠️ <strong>CRITICAL:</strong> Write down or copy this
                          secret! You MUST use the exact same secret to reveal.
                          If you lose it, you'll lose your fee.
                        </p>
                      </div>
                      {secret && (
                        <div className="mt-2 p-2 bg-blue-500/20 border border-blue-400 rounded">
                          <p className="text-xs text-blue-200">
                            ✓ Your secret:{" "}
                            <strong className="font-mono">{secret}</strong>{" "}
                            (auto-saved to session)
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Commit Button */}
                    <button
                      onClick={handleCommit}
                      disabled={
                        !selectedNFT || !secret || loading || isWritePending
                      }
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition"
                    >
                      {commitArgs && !isWritePending
                        ? "Simulating..."
                        : isWritePending && pendingTxType === "commit"
                          ? "Waiting for wallet..."
                          : loading
                            ? "Processing..."
                            : `Commit to Play (${playFee ? ethers.formatEther(playFee) : "0"} ETH)`}
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Last Result */}
            {lastResult && (
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-lg p-6 mb-6 border-2 border-green-400">
                <h2 className="text-2xl font-bold mb-4">🎉 Swap Complete!</h2>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-white/10 p-4 rounded-lg">
                    <p className="opacity-70 text-sm mb-2">You Deposited</p>
                    <p className="text-3xl font-bold">
                      #{lastResult.deposited}
                    </p>
                  </div>
                  <div
                    className={`bg-gradient-to-r ${RARITY_COLORS[lastResult.rarity]} p-4 rounded-lg`}
                  >
                    <p className="opacity-90 text-sm mb-2">You Received</p>
                    <p className="text-3xl font-bold">#{lastResult.received}</p>
                    <p className="text-sm mt-1">
                      {RARITY_NAMES[lastResult.rarity]}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setLastResult(null)}
                  className="mt-4 w-full bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition"
                >
                  Close
                </button>
              </div>
            )}

            {/* Status Message */}
            {message && (
              <div
                className={`rounded-lg p-4 mb-6 ${
                  message.includes("failed") || message.includes("Failed")
                    ? "bg-red-500/20 border-2 border-red-400"
                    : message.includes("successful") ||
                        message.includes("confirmed")
                      ? "bg-green-500/20 border-2 border-green-400"
                      : "bg-blue-500/20 border-2 border-blue-400"
                }`}
              >
                <p className="text-center">{message}</p>
              </div>
            )}

            {/* How to Play */}
            <div className="bg-white/5 backdrop-blur-lg rounded-lg p-6">
              <h3 className="font-bold mb-3">📖 How to Play</h3>
              <ol className="space-y-2 text-sm opacity-80">
                <li>
                  1. Select an NFT from your wallet and set its rarity tier
                </li>
                <li>2. Generate and save your secret number</li>
                <li>3. Commit to play (pay the fee and approve NFT)</li>
                <li>4. Wait 2+ blocks for security</li>
                <li>5. Reveal with your secret to swap for a random NFT</li>
              </ol>
              <p className="text-xs opacity-60 mt-4">
                Higher rarity tiers have lower swap odds. The pool uses weighted
                random selection.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Game History */}
      <div className="bg-white/5 backdrop-blur-lg rounded-lg p-6 mt-6">
        <h3 className="font-bold mb-4">📊 Your Stats & History</h3>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 text-sm">
            <div className="bg-white/10 p-3 rounded">
              <span className="opacity-70 block">Total Games</span>
              <p className="text-xl font-bold">{stats.totalGames}</p>
            </div>
            <div className="bg-white/10 p-3 rounded">
              <span className="opacity-70 block">Total Fees</span>
              <p className="text-xl font-bold">
                {ethers.formatEther(stats.totalFeePaid)} ETH
              </p>
            </div>
            <div className="bg-white/10 p-3 rounded col-span-2 md:col-span-1">
              <span className="opacity-70 block">Tiers Received</span>
              <p className="text-xs mt-1">
                S:{stats.tierSReceived} A:{stats.tierAReceived} B:
                {stats.tierBReceived} C:{stats.tierCReceived} D:
                {stats.tierDReceived}
              </p>
            </div>
          </div>
        )}

        {gameHistory.length > 0 ? (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm opacity-70 mb-2">
              Recent Games
            </h4>
            {gameHistory.map((game) => (
              <div
                key={game.id}
                className="bg-white/10 p-3 rounded flex justify-between items-center text-sm"
              >
                <div>
                  <p>
                    #{game.depositedTokenId} → #{game.receivedTokenId}
                  </p>
                  <p className="text-xs opacity-70">
                    {new Date(game.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded bg-gradient-to-r ${RARITY_COLORS[game.receivedRarity]} text-xs font-bold`}
                >
                  {RARITY_NAMES[game.receivedRarity]}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center opacity-70 text-sm">No games played yet</p>
        )}
      </div>

      {/* Loading Overlay */}
      {(loading || isWritePending) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-lg">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
    </div>
  );
}
