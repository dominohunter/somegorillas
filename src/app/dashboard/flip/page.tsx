"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
  useWatchContractEvent,
} from "wagmi";
import { COINFLIP_BETTING_ABI, COINFLIP_BETTING_ADDRESS } from "@/lib/config";
import { usePublicClient } from "wagmi";
import { decodeEventLog } from "viem";
import { GlareButton } from "@/components/ui/glare-button";
import CoinFlip from "@/components/animations/coin-flip";
import { CartoonButton } from "@/components/ui/cartoon-button";
import Head from "@/components/icons/head";
import Butt from "@/components/icons/butt";
import { useLogin } from "@/hooks/use-login";
import api from "@/lib/axios";
import WinDetailsModal from "@/components/modals/win-details-modal";
import FlipResultModal from "@/components/modals/flip-result-modal";
import { useChainValidation } from "@/hooks/use-chain-validation";
import { REQUIRED_CHAIN_ID } from "@/lib/config";
import { useChainId } from "wagmi";

// Types
interface FlipGameBet {
  blokchainBetId: string;
  playerAddress: string;
  amount: string;
  winBp: number;
  userChoice: string;
  status: string;
  isWin?: boolean;
  winAmount?: string;
  resolvedAt?: string;
  betTxHash: string;
  actualResult?: string;
}

interface BetHistoryResponse {
  bets: FlipGameBet[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const BET_EVENT_ABI = {
  anonymous: false,
  inputs: [
    {
      indexed: false,
      internalType: "uint256",
      name: "betId",
      type: "uint256",
    },
    {
      indexed: true,
      internalType: "address",
      name: "owner",
      type: "address",
    },
    {
      indexed: false,
      internalType: "uint256",
      name: "amount",
      type: "uint256",
    },
  ],
  name: "Bet",
  type: "event",
};

export default function FlipPage() {
  const router = useRouter();
  const publicClient = usePublicClient();
  const { address, isConnected } = useAccount();
  const { login, isLoading: isLoginLoading } = useLogin();
  const chainId = useChainId();

  // Chain validation
  const { isOnCorrectChain, switchToCorrectChain } = useChainValidation();

  const [betAmount, setBetAmount] = useState("1");
  const [multiplier] = useState(20000); // 2x
  const [userChoice, setUserChoice] = useState<"heads" | "tails">("heads");
  const [loading, setLoading] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [gameHistory, setGameHistory] = useState<FlipGameBet[]>([]);
  const [activeBetId, setActiveBetId] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<{
    isWin: boolean;
    betAmount: string;
    winAmount?: string;
    userChoice: string;
    betId?: string;
    actualResult?: string;
    multiplier?: number;
  } | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null,
  );

  const { data: hash, error: writeError, writeContract } = useWriteContract();

  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
    confirmations: 1,
  });

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && hash) {
      handleBetSubmission();
    }
  }, [isConfirmed, hash]);

  // Handle write contract errors
  useEffect(() => {
    if (writeError) {
      console.error("Write contract error:", writeError);
      setLoading(false);

      const errorMessage = writeError.message || writeError.toString();

      if (errorMessage.includes("User rejected")) {
        toast.error("Transaction cancelled", {
          description: "You cancelled the transaction in your wallet.",
        });
      } else if (errorMessage.includes("insufficient funds")) {
        toast.error("Insufficient funds", {
          description:
            "You don't have enough STT to complete this transaction.",
        });
      } else if (errorMessage.includes("execution reverted")) {
        toast.error("Contract error", {
          description:
            "The contract rejected this transaction. Check if the multiplier is allowed.",
        });
      } else {
        toast.error("Transaction failed", {
          description: errorMessage,
        });
      }
    }
  }, [writeError]);

  const handleBetSubmission = async () => {
    try {
      if (!hash || !publicClient) return;
      // Get transaction receipt
      const receipt = await publicClient.getTransactionReceipt({ hash });

      // Parse logs to find bet ID
      let betId: string | null = null;

      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: [BET_EVENT_ABI],
            data: log.data,
            topics: log.topics,
          });
          if (!decoded || !decoded.args) {
            throw new Error("No decoded found");
          }
          console.log(decoded);

          if (decoded.eventName === "Bet") {
            betId = (
              decoded.args as unknown as { betId: bigint }
            ).betId.toString();
            break;
          }
        } catch (error) {
          console.log(error);
          // Skip logs that don't match our event
          continue;
        }
      }

      if (!betId) {
        throw new Error("Bet ID not found in transaction logs");
      }

      const response = await api.post("/game/bet", {
        betId,
        txHash: hash,
        player: address,
        amount: ethers.parseEther(betAmount).toString(),
        winBp: multiplier,
        userChoice,
      });

      if (response.status === 200 || response.status === 201) {
        setIsFlipping(true);
        setActiveBetId(betId); // Set active bet ID for event listening
        toast.success("Bet placed successfully!");
        console.log(
          `Started listening for bet result events for betId: ${betId}`,
        );

        // Add timeout fallback and periodic backend polling
        setTimeout(() => {
          if (activeBetId === betId) {
            console.log(
              `Timeout fallback for betId: ${betId} - checking backend`,
            );
            checkBackendForResult(betId);
          }
        }, 30000); // 30 second fallback

        // Start periodic polling for result
        startPollingForResult(betId);
      }
    } catch (error) {
      console.error("Bet submission failed:", error);
      toast.error("Failed to place bet");
      setLoading(false);
    }
  };

  const checkBackendForResult = async (betId: string) => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("gorillaz_token")
          : null;

      if (!token) {
        console.log("No auth token for result check");
        return;
      }

      const response = await fetch(
        `http://localhost:3001/api/game/bet/${betId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const bet: FlipGameBet = await response.json();
        console.log("Backend bet result:", bet);

        // Check if the bet is settled
        if (bet.status === "settled" && bet.isWin !== undefined) {
          console.log("Found settled bet result:", bet);

          // Clear polling
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }

          // Update UI state
          setIsFlipping(false);
          setLoading(false);
          setActiveBetId(null);

          setResult({
            isWin: bet.isWin,
            betAmount,
            winAmount: bet.winAmount
              ? ethers.formatEther(bet.winAmount)
              : undefined,
            userChoice,
            betId: bet.blokchainBetId,
            actualResult:
              bet.actualResult ||
              (bet.isWin
                ? userChoice
                : userChoice === "heads"
                  ? "tails"
                  : "heads"),
            multiplier: bet.winBp,
          });
          setShowResult(true);

          if (bet.isWin) {
            toast.success("You won!", {
              description: bet.winAmount
                ? `Congratulations! You won ${ethers.formatEther(bet.winAmount)} SOMI!`
                : "Congratulations on your win!",
            });
          } else {
            toast.error("You lost 😢", {
              description: "Better luck next time!",
            });
          }

          loadGameHistory();
        }
      }
    } catch (error) {
      console.error("Failed to check backend for result:", error);
    }
  };

  const startPollingForResult = (betId: string) => {
    // Clear any existing polling
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    // Poll every 5 seconds for up to 2 minutes
    let attempts = 0;
    const maxAttempts = 24; // 2 minutes / 5 seconds

    const interval = setInterval(async () => {
      attempts++;
      console.log(`Polling attempt ${attempts} for betId: ${betId}`);

      if (attempts >= maxAttempts) {
        console.log("Max polling attempts reached");
        clearInterval(interval);
        setPollingInterval(null);

        // Final fallback - just stop the loading states
        if (activeBetId === betId) {
          setIsFlipping(false);
          setLoading(false);
          setActiveBetId(null);
          toast.info(
            "Bet processing timeout - check your bet history for updates",
          );
        }
        return;
      }

      // Only continue polling if this is still our active bet
      if (activeBetId === betId) {
        await checkBackendForResult(betId);
      } else {
        // This bet is no longer active, stop polling
        clearInterval(interval);
        setPollingInterval(null);
      }
    }, 5000); // Poll every 5 seconds

    setPollingInterval(interval);
  };

  // Cleanup polling on component unmount or when activeBetId changes
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const placeBet = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    // Check if user is on correct network
    if (chainId !== REQUIRED_CHAIN_ID) {
      toast.error("Please switch to Somnia network to place bets");
      return;
    }

    // Validate bet amount
    if (!betAmount || parseFloat(betAmount) <= 0) {
      toast.error("Please enter a valid bet amount");
      return;
    }

    setLoading(true);

    try {
      // First, let's test if we can read from the contract at all
      if (publicClient) {
        try {
          console.log("Testing basic contract read...");
          const contractName = await publicClient.readContract({
            address: COINFLIP_BETTING_ADDRESS as `0x${string}`,
            abi: COINFLIP_BETTING_ABI,
            functionName: "name",
            args: [],
          });
          console.log("Contract name:", contractName);

          const isPaused = await publicClient.readContract({
            address: COINFLIP_BETTING_ADDRESS as `0x${string}`,
            abi: COINFLIP_BETTING_ABI,
            functionName: "paused",
            args: [],
          });
          console.log("Contract paused:", isPaused);

          if (isPaused) {
            setLoading(false);
            toast.error("The betting contract is currently paused");
            return;
          }

          const isMultiplierAllowed = await publicClient.readContract({
            address: COINFLIP_BETTING_ADDRESS as `0x${string}`,
            abi: COINFLIP_BETTING_ABI,
            functionName: "betWinAmountBP",
            args: [BigInt(multiplier)],
          });
          console.log(`Multiplier ${multiplier} allowed:`, isMultiplierAllowed);

          if (!isMultiplierAllowed) {
            setLoading(false);
            toast.error(
              `Multiplier ${multiplier / 10000}x is not allowed. The contract admin needs to enable this multiplier first.`,
            );
            return;
          }

          console.log("All checks passed, proceeding with bet...");
        } catch (checkError) {
          console.error("Contract state check failed:", checkError);
          setLoading(false);
          toast.error(`Contract is not responding. Error: ${checkError}`);
          return;
        }
      }

      console.log("Placing bet with parameters:", {
        address: COINFLIP_BETTING_ADDRESS,
        functionName: "bet",
        args: [BigInt(multiplier)],
        value: ethers.parseEther(betAmount).toString(),
        multiplier,
        betAmount,
      });

      // Try to estimate gas first
      try {
        const gasEstimate = await publicClient?.estimateContractGas({
          address: COINFLIP_BETTING_ADDRESS as `0x${string}`,
          abi: COINFLIP_BETTING_ABI,
          functionName: "bet",
          args: [BigInt(multiplier)],
          value: ethers.parseEther(betAmount),
          account: address as `0x${string}`,
        });
        console.log("Gas estimate:", gasEstimate);
      } catch (gasError) {
        console.error("Gas estimation failed:", gasError);
        setLoading(false);

        const errorMessage =
          gasError instanceof Error ? gasError.message : "Unknown error";

        if (errorMessage.includes("TREASURY NOT ENOUGH")) {
          toast.error("Contract treasury insufficient", {
            description:
              "The betting contract doesn't have enough funds to pay potential winnings. Contact the admin to fund the treasury.",
          });
        } else {
          toast.error(`Gas estimation failed: ${errorMessage}`);
        }
        return;
      }

      console.log("Gas estimation successful, submitting transaction...");

      writeContract({
        address: COINFLIP_BETTING_ADDRESS as `0x${string}`,
        abi: COINFLIP_BETTING_ABI,
        functionName: "bet",
        args: [BigInt(multiplier)],
        value: ethers.parseEther(betAmount),
      });
    } catch (error) {
      console.error("Contract call error:", error);
      setLoading(false);
      toast.error(
        `Transaction failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const loadGameHistory = async () => {
    try {
      if (!address) return;

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("gorillaz_token")
          : null;
      if (!token) {
        console.log("No authentication token found - user needs to login");
        setGameHistory([]);
        return;
      }

      const response = await api.get("game/bet/history");

      if (response.data.bets) {
        const betHistoryResponse: BetHistoryResponse = await response.data;
        setGameHistory(betHistoryResponse.bets);
      } else if (response.status === 401 || response.status === 403) {
        console.log("Authentication failed - user needs to login");
        toast.error("Please login to view bet history");
        setGameHistory([]);
      } else {
        throw new Error(`Failed to load history: ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to load bet history:", error);
      setGameHistory([]);
    }
  };

  const handleLogin = async () => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      const result = await login(address);
      if (result.success) {
        toast.success("Successfully logged in!");
        loadGameHistory();
      } else {
        toast.error(result.error?.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Failed to login");
    }
  };

  useEffect(() => {
    if (address) {
      loadGameHistory();
    }
  }, [address]);

  // Listen for ALL bet events (no filtering) to debug
  useWatchContractEvent({
    address: COINFLIP_BETTING_ADDRESS as `0x${string}`,
    abi: COINFLIP_BETTING_ABI,
    eventName: "BetWin",
    onLogs: (logs) => {
      console.log("🎉 BetWin events received:", logs);
      console.log("Current activeBetId:", activeBetId);
      console.log("Current address:", address);

      logs.forEach((log) => {
        console.log("Processing BetWin log:", log);

        const { betId, winner, amount } = log.args as {
          betId: bigint;
          winner: string;
          amount: bigint;
        };

        console.log("BetWin details:", {
          betId: betId.toString(),
          winner: winner.toLowerCase(),
          amount: ethers.formatEther(amount),
          isOurBet: betId.toString() === activeBetId,
          isOurAddress: winner.toLowerCase() === address?.toLowerCase(),
        });

        // Check if this is our active bet
        if (
          activeBetId &&
          betId.toString() === activeBetId &&
          winner.toLowerCase() === address?.toLowerCase()
        ) {
          console.log("🎉 WE WON!", {
            betId: betId.toString(),
            amount: ethers.formatEther(amount),
          });

          // Clear polling since we got the blockchain event
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }

          setIsFlipping(false);
          setLoading(false); // Reset loading state
          setActiveBetId(null);
          setResult({
            isWin: true,
            betAmount,
            winAmount: ethers.formatEther(amount),
            userChoice,
            betId: betId.toString(),
            actualResult: userChoice, // If we won, the actual result matches our choice
            multiplier: multiplier,
          });
          setShowResult(true);

          toast.success("You won!", {
            description: `Congratulations! You won ${ethers.formatEther(amount)} SOMI!`,
          });

          loadGameHistory();
        }
      });
    },
    enabled: !!activeBetId && !!address,
  });

  // Listen for ALL BetLost events (no filtering) to debug
  useWatchContractEvent({
    address: COINFLIP_BETTING_ADDRESS as `0x${string}`,
    abi: COINFLIP_BETTING_ABI,
    eventName: "BetLost",
    onLogs: (logs) => {
      console.log("😢 BetLost events received:", logs);
      console.log("Current activeBetId:", activeBetId);
      console.log("Current address:", address);

      logs.forEach((log) => {
        console.log("Processing BetLost log:", log);

        const { betId, loser } = log.args as {
          betId: bigint;
          loser: string;
          amount: bigint;
        };

        console.log("BetLost details:", {
          betId: betId.toString(),
          loser: loser.toLowerCase(),
          isOurBet: betId.toString() === activeBetId,
          isOurAddress: loser.toLowerCase() === address?.toLowerCase(),
        });

        // Check if this is our active bet
        if (
          activeBetId &&
          betId.toString() === activeBetId &&
          loser.toLowerCase() === address?.toLowerCase()
        ) {
          console.log("😢 WE LOST!", { betId: betId.toString() });

          // Clear polling since we got the blockchain event
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }

          setIsFlipping(false);
          setLoading(false); // Reset loading state
          setActiveBetId(null);
          setResult({
            isWin: false,
            betAmount,
            userChoice,
            betId: betId.toString(),
            actualResult: userChoice === "heads" ? "tails" : "heads", // If we lost, it's the opposite
            multiplier: multiplier,
          });
          setShowResult(true);

          toast.error("You lost 😢", {
            description: "Better luck next time!",
          });

          loadGameHistory();
        }
      });
    },
    enabled: !!activeBetId && !!address,
  });

  return (
    <div className="w-full">
      <div className="max-w-[600px] mx-auto space-y-6 p-4">
        {/* Back Button */}
        <div className="flex justify-start">
          <GlareButton
            onClick={() => router.back()}
            background="rgba(255, 255, 255, 0.04)"
            borderRadius="12px"
            glareColor="#ffffff"
            borderColor="rgba(255, 255, 255, 0.04)"
            className="backdrop-blur-[40px] h-[44px] py-2 px-4 flex items-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 12H5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 19l-7-7 7-7"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-light-primary font-semibold text-button-48">
              Back
            </span>
          </GlareButton>
        </div>

        {/*{isConnected && !isOnCorrectChain && (
          <div className="backdrop-blur-[60px] bg-red-500/20 border-2 rounded-3xl border-red-500/40 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-red-300 font-semibold">⚠️ Wrong Network</h3>
                <p className="text-red-200 text-sm">
                  Switch to Chain ID {requiredChainId} to play
                </p>
              </div>
              <button
                onClick={switchToCorrectChain}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Switch
              </button>
            </div>
          </div>
        )}*/}

        {/* Main Betting Interface */}
        <div className="backdrop-blur-[60px] bg-translucent-dark-12 border-2 rounded-3xl border-translucent-light-4 px-6 pb-6 pt-10">
          <div className="space-y-6 flex flex-col justify-center items-center">
            <CoinFlip
              isFlipping={isFlipping}
              result={null}
              prediction={userChoice}
              onAnimationComplete={() => {}}
              size={240}
            />

            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-3">
                {(["heads", "tails"] as const).map((choice) => (
                  <CartoonButton
                    key={choice}
                    variant={userChoice === choice ? "primary" : "secondary"}
                    size="md"
                    shadow="cartoon"
                    onClick={() => setUserChoice(choice)}
                    className={`flex items-center justify-center gap-2 font-bold transition-all duration-300 ease-in-out w-full transform ${
                      userChoice === choice
                        ? "!bg-white !text-black !border-[#0f1012] scale-105"
                        : "!text-black !border-translucent-light-4 hover:bg-accent-primary hover:text-light-primary scale-100"
                    }`}
                  >
                    {choice === "heads" ? (
                      <Head size={24} />
                    ) : (
                      <Butt size={24} />
                    )}
                    {choice === "heads" ? "Pick Head" : "Pick Butt"}
                  </CartoonButton>
                ))}
              </div>

              <label className="block text-translucent-light-80 text-body-1 font-medium font-pally text-center">
                Choose coin side
              </label>
            </div>

            {/* Bet Amount Selection */}
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-3 gap-3">
                {["1", "2", "5", "10", "25", "50"].map((amount) => (
                  <CartoonButton
                    key={amount}
                    variant={betAmount === amount ? "primary" : "secondary"}
                    size="sm"
                    shadow="cartoon"
                    onClick={() => setBetAmount(amount)}
                    className={`text-center font-bold transition-all duration-300 ease-in-out w-full transform ${
                      betAmount === amount
                        ? "!text-black !border-[#0f1012] scale-105"
                        : "!text-black !border-translucent-light-4 hover:bg-accent-primary hover:text-light-primary scale-100"
                    }`}
                  >
                    {amount} SOMI
                  </CartoonButton>
                ))}
              </div>

              <label className="block text-translucent-light-80 text-body-1 font-medium font-pally text-center">
                Choose wager amount
              </label>
            </div>

            {/* Multiplier Selection */}

            {/* Coin Side Selection */}

            {/* Potential Win Display */}
            <div className="flex justify-center mb-6">
              <CartoonButton
                onClick={!isOnCorrectChain ? switchToCorrectChain : placeBet}
                disabled={loading || isFlipping}
                size={"md"}
                variant={"secondary"}
              >
                <img src={"/coin/idle.svg"} alt="Coin" className="w-6 h-6" />
                {loading
                  ? "Processing..."
                  : isFlipping
                    ? "Flipping..."
                    : !isOnCorrectChain
                      ? "Switch to Somnia"
                      : "Flip"}
              </CartoonButton>
            </div>
          </div>
        </div>

        {/* Bet Button */}

        {/* Bet History Section */}
        <div className="backdrop-blur-[60px] bg-translucent-dark-12 border-2 rounded-3xl border-translucent-light-4 px-6 pb-6 pt-10">
          <h2 className="text-h4 font-bold text-white mb-6 font-pally text-center">
            Bet History
          </h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {gameHistory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-translucent-light-64 font-pally mb-2">
                  {typeof window !== "undefined" &&
                  !localStorage.getItem("gorillaz_token")
                    ? "Please login to view your bet history"
                    : "No bets placed yet"}
                </p>
                {typeof window !== "undefined" &&
                  !localStorage.getItem("gorillaz_token") && (
                    <div className="space-y-4">
                      <p className="text-translucent-light-48 text-sm font-pally">
                        Connect your wallet and sign a message to authenticate
                      </p>
                      {isConnected && (
                        <GlareButton
                          onClick={handleLogin}
                          disabled={isLoginLoading}
                          background="#10B981"
                          borderRadius="12px"
                          borderColor="transparent"
                          glareColor="#ffffff"
                          glareOpacity={0.3}
                          className={`px-6 py-2 text-sm font-semibold ${
                            isLoginLoading
                              ? "text-gray-200 cursor-not-allowed"
                              : "text-white"
                          }`}
                        >
                          {isLoginLoading
                            ? "Signing..."
                            : "Login to View History"}
                        </GlareButton>
                      )}
                    </div>
                  )}
              </div>
            ) : (
              gameHistory?.map((bet) => (
                <div
                  key={bet.blokchainBetId}
                  className="backdrop-blur-[60px] bg-translucent-dark-8 border border-translucent-light-4 rounded-2xl p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="text-white font-medium font-pally">
                      {bet.userChoice.charAt(0).toUpperCase() +
                        bet.userChoice.slice(1)}{" "}
                      - {ethers.formatEther(bet.amount)} SOMI
                    </p>
                    {/*<p className="text-translucent-light-64 text-sm font-pally">
                      Multiplier: {bet.winBp / 10000}x
                    </p>*/}
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <p
                      className={`font-bold font-pally ${
                        bet.isWin ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {bet.isWin ? "WIN" : "LOSS"}
                    </p>
                    {bet.isWin && bet.winAmount && (
                      <p className="text-green-400 text-sm font-pally">
                        +{ethers.formatEther(bet.winAmount)} SOMI
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Win Details Modal for STT betting wins */}
      {showResult && result && result.isWin && result.winAmount && (
        <WinDetailsModal
          isOpen={showResult}
          onClose={() => {
            setShowResult(false);
            setResult(null);
          }}
          winDetails={{
            betId: result.betId || "Unknown",
            userChoice: result.userChoice,
            actualResult: result.actualResult || result.userChoice,
            betAmount: ethers.parseEther(result.betAmount).toString(),
            winAmount: ethers.parseEther(result.winAmount).toString(),
            multiplier: result.multiplier || multiplier,
            transactionHash: hash,
          }}
        />
      )}

      {/* Flip Result Modal for loses and non-STT games */}
      {showResult && result && (!result.isWin || !result.winAmount) && (
        <FlipResultModal
          isOpen={showResult}
          onClose={() => {
            setShowResult(false);
            setResult(null);
          }}
          result={{
            result:
              result.actualResult ||
              (result.isWin
                ? result.userChoice
                : result.userChoice === "heads"
                  ? "tails"
                  : "heads"),
            prediction: result.userChoice,
            isWin: result.isWin,
          }}
        />
      )}
    </div>
  );
}
