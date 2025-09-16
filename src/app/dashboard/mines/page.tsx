"use client";

import React, { useState, useEffect, useCallback } from "react";
import { parseEther, formatEther, decodeEventLog } from "viem";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
  useReadContract,
} from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axiosClient from "@/lib/axios";
import { MINEGAME_ABI } from "@/lib/mine-abi";
import Image from "next/image";

interface Game {
  id: string;
  blockchainGameId?: string;
  mineCount: number;
  boardSize: number;
  betAmount: string;
  gameState: "WAITING" | "PLAYING" | "CASHED_OUT" | "EXPLODED" | "PERFECT";
  tilesRevealed: number;
  revealedTiles: number[];
  minePositions?: number[];
  createdAt?: string;
  endedAt?: string;
}

interface RevealResponse {
  success: boolean;
  isMine: boolean;
  tileIndex: number;
  gameComplete: boolean;
  gameState: string;
  tilesRevealed: number;
  revealedTiles: number[];
}

interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesPerfect: number;
  totalTilesRevealed: number;
  totalMinesHit: number;
  currentWinStreak: number;
  bestWinStreak: number;
  highestTilesInGame: number;
}

interface GameHistory {
  games: Game[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const CONTRACT_ADDRESS = "0x5aAf078087a6FC75dD29b51665ce18063B2F139f";

export default function EnhancedMineGameApp() {
  // Wallet state from wagmi (similar to coin flip)
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();

  // Game state
  const [mineCount, setMineCount] = useState<number>(3);
  const [gameFee, setGameFee] = useState<string>("0");
  const [backendGame, setBackendGame] = useState<Game | null>(null);
  const [revealedTiles, setRevealedTiles] = useState<Set<number>>(new Set());
  const [mineTiles, setMineTiles] = useState<Set<number>>(new Set());
  const [flippingTiles, setFlippingTiles] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [pendingTxType, setPendingTxType] = useState<
    "startGame" | "cashOut" | null
  >(null);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  const [gameHistory, setGameHistory] = useState<GameHistory | null>(null);
  const [userStats, setUserStats] = useState<GameStats | null>(null);
  const [historyPage, setHistoryPage] = useState(1);

  // Client-side initialization
  const [isClient, setIsClient] = useState(false);

  // Blockchain hooks (wagmi pattern like coin flip)
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

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load user data when wallet connects
  useEffect(() => {
    if (isConnected && address && isClient) {
      loadUserData();
    }
  }, [isConnected, address, isClient]);

  // Handle write contract errors (similar to coin flip)
  useEffect(() => {
    if (writeError) {
      console.error("Write contract error:", writeError);
      setLoading(false);
      setPendingTxType(null); // Reset pending transaction type on error

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
      } else {
        toast.error("Transaction failed", {
          description: writeError.message,
        });
      }
    }
  }, [writeError]);

  // Handle successful transaction submission
  useEffect(() => {
    if (hash && !writeError && pendingTxType) {
      if (pendingTxType === "startGame") {
        toast.success("Game transaction submitted", {
          description: "Your mine game is being processed on the blockchain.",
        });
        setMessage("Digging into the blockchain...");
      } else if (pendingTxType === "cashOut") {
        toast.success("Cash out transaction submitted", {
          description: "Your cash out is being processed on the blockchain.",
        });
        setMessage("Mining your rewards...");
      }
    }
  }, [hash, writeError, pendingTxType]);

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && receipt && hash && pendingTxType) {
      if (pendingTxType === "startGame") {
        processGameStart();
      } else if (pendingTxType === "cashOut") {
        processCashOut();
      }
      setPendingTxType(null); // Clear the pending transaction type
    }
  }, [isConfirmed, receipt, hash, pendingTxType]);
  const loadUserData = async () => {
    if (!address) return;

    try {
      await Promise.all([
        loadActiveGame(address),
        loadUserStats(address),
        loadGameHistory(address, 1),
      ]);
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  };

  // Read game fee using wagmi
  const { data: gameFeeData } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: MINEGAME_ABI,
    functionName: "gameFee",
    query: {
      enabled: isConnected && !!address,
    },
  });

  // Update gameFee state when contract data changes
  useEffect(() => {
    if (gameFeeData) {
      const feeInEth = formatEther(gameFeeData as bigint);
      setGameFee(feeInEth);
      console.log("Loaded game fee:", feeInEth, "ETH");
    } else if (isConnected) {
      // Fallback to default fee if contract read fails
      setGameFee("0.01");
    }
  }, [gameFeeData, isConnected]);

  const loadActiveGame = async (userAddress: string): Promise<void> => {
    try {
      const response = await axiosClient.get(`mine/active/${userAddress}`);
      const data = response.data;

      if (data.success && data.game) {
        setBackendGame(data.game);
        setRevealedTiles(new Set(data.game.revealedTiles || []));

        // If game is ended and has mine positions, show all mines
        if (data.game.gameState !== "PLAYING" && data.game.minePositions) {
          setMineTiles(new Set(data.game.minePositions));
          // Also reveal all tiles when game is over
          const allRevealedTiles = new Set([
            ...(data.game.revealedTiles || []),
            ...(data.game.minePositions || []),
          ]);
          setRevealedTiles(allRevealedTiles);
        } else {
          // During active game, only track mines that have been hit
          setMineTiles(new Set());
        }

        console.log("Loaded active game:", data.game);
      }
    } catch (err) {
      console.error("Failed to load active game:", err);
    }
  };

  const loadUserStats = async (userAddress: string): Promise<void> => {
    try {
      const response = await axiosClient.get(`mine/stats/${userAddress}`);
      const data = response.data;

      if (data.success) {
        setUserStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to load user stats:", err);
    }
  };

  const loadGameHistory = async (
    userAddress: string,
    page: number = 1,
  ): Promise<void> => {
    try {
      const response = await axiosClient.get(
        `mine/history/${userAddress}?page=${page}&limit=10`,
      );
      const data = response.data;

      if (data.success) {
        setGameHistory(data);
        setHistoryPage(page);
      }
    } catch (err) {
      console.error("Failed to load game history:", err);
    }
  };

  const processGameStart = async (): Promise<void> => {
    if (!receipt || !hash) return;

    try {
      setMessage("Connecting to mining network...");

      // Extract gameId from blockchain events
      const logs = receipt.logs;
      let blockchainGameId = null;

      for (const log of logs) {
        try {
          // Check if log is from our contract
          if (log.address.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()) {
            // Parse the log using viem's decodeEventLog with specific event name
            const parsedLog = decodeEventLog({
              abi: MINEGAME_ABI,
              topics: log.topics,
              data: log.data,
              eventName: "GameStarted",
            });

            // Check if this is a GameStarted event and extract gameId
            if (
              parsedLog &&
              parsedLog.eventName === "GameStarted" &&
              parsedLog.args
            ) {
              // GameStarted event args: gameId (indexed), player (indexed), mineCount, betAmount
              blockchainGameId = parsedLog.args.gameId.toString();
              console.log(
                "Found GameStarted event with gameId:",
                blockchainGameId,
                "Full args:",
                parsedLog.args,
              );
              break;
            }
          }
        } catch (parseError) {
          console.log("Could not parse log as GameStarted:", parseError);
          // Try parsing without specifying event name as fallback
          try {
            const parsedLog = decodeEventLog({
              abi: MINEGAME_ABI,
              topics: log.topics,
              data: log.data,
            });
            if (
              parsedLog &&
              parsedLog.eventName === "GameStarted" &&
              parsedLog.args
            ) {
              blockchainGameId = parsedLog.args.gameId.toString();
              console.log(
                "Found GameStarted event (fallback method) with gameId:",
                blockchainGameId,
              );
              break;
            }
          } catch (fallbackError) {
            console.log("Fallback parsing also failed:", fallbackError);
          }
          continue;
        }
      }

      if (blockchainGameId && backendGame) {
        // Link backend game with blockchain game ID
        try {
          const linkResponse = await axiosClient.post(`mine/link`, {
            id: backendGame.id,
            blockchainGameId: blockchainGameId,
            transactionHash: hash,
          });

          const linkResult = linkResponse.data;

          if (linkResult.success) {
            setBackendGame(linkResult.game);
            setMessage("Game started successfully!");
            toast.success("Game started!", {
              description: "Your mine game has been created successfully.",
            });
          } else {
            throw new Error(linkResult.error || "Failed to link game");
          }
        } catch (linkError) {
          console.error("Failed to link game:", linkError);
          toast.error("Game linking failed", {
            description:
              "The game was created but linking failed. Refreshing game state...",
          });
          // Try to reload the active game as fallback
          if (address) {
            await loadActiveGame(address);
          }
        }
      } else {
        console.warn("Could not find GameStarted event or no backend game", {
          blockchainGameId,
          backendGame: !!backendGame,
          logsCount: logs.length,
        });
        toast.warning("Event parsing issue", {
          description: "Game may have started. Checking backend state...",
        });
        // Try to reload the active game as fallback
        if (address) {
          await loadActiveGame(address);
          setMessage("Scanning mining tunnels...");
        } else {
          setMessage("Game may have started but event parsing failed");
        }
      }
    } catch (error) {
      console.error("Error processing game start:", error);
      toast.error("Game processing failed", {
        description:
          "There was an error processing the game. Checking backend state...",
      });
      // Try to reload the active game as final fallback
      if (address) {
        try {
          await loadActiveGame(address);
          setMessage("Mining operation recovered successfully");
        } catch (fallbackError) {
          console.error("Failed to recover game state:", fallbackError);
          setMessage("Mining equipment malfunction. Please refresh the page.");
        }
      }
    }

    setLoading(false);
  };

  // Show confirmation dialog
  const showGameConfirmation = (): void => {
    if (!address || !isConnected) {
      toast.error("Wallet not connected", {
        description: "Please connect your wallet to start playing.",
      });
      return;
    }
    setShowConfirmation(true);
  };

  // Start game - integrated with wagmi
  const startGame = async (): Promise<void> => {
    setShowConfirmation(false);
    setLoading(true);
    setMessage("Preparing mining equipment...");

    try {
      // Step 1: Create backend session
      const sessionResponse = await axiosClient.post(`mine/start`, {
        userAddress: address,
        mineCount,
        betAmount: parseEther(gameFee).toString(),
      });

      const session = sessionResponse.data;

      if (!session.success) {
        throw new Error(session.error || "Failed to start game");
      }

      setBackendGame(session.game);
      setRevealedTiles(new Set()); // Reset revealed tiles
      setMineTiles(new Set()); // Reset mine tiles
      setFlippingTiles(new Set()); // Reset flipping tiles
      setMessage("Starting mining operation...");

      // Step 2: Create blockchain game using wagmi
      setPendingTxType("startGame");
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: MINEGAME_ABI,
        functionName: "startGame",
        args: [mineCount],
        value: parseEther(gameFee),
      });
    } catch (error: any) {
      console.error("Start game error:", error);
      setMessage(`Error: ${error.message}`);
      toast.error("Failed to start game", {
        description: error.message,
      });
      setLoading(false);
    }
  };

  // Reveal tile with flip animation
  const revealTile = async (tileIndex: number): Promise<void> => {
    if (!backendGame || flippingTiles.has(tileIndex) || !address) return;
    if (revealedTiles.has(tileIndex)) return;

    // Start flip animation
    setFlippingTiles((prev) => new Set([...prev, tileIndex]));

    try {
      // Use backend game ID for reveal calls (backend-only operation)
      const gameId = backendGame.blockchainGameId || backendGame.id;
      const response = await axiosClient.post(
        `mine/reveal/${gameId}/${tileIndex}`,
        {}, // Empty body for POST request
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const result: RevealResponse = response.data;

      // Wait for flip animation to complete (600ms)
      setTimeout(async () => {
        if (!result.success) {
          toast.error("Reveal failed", {
            description: (result as any).error || "Could not reveal tile",
          });
          // Remove from flipping tiles on error
          setFlippingTiles((prev) => {
            const newSet = new Set(prev);
            newSet.delete(tileIndex);
            return newSet;
          });
        } else {
          setRevealedTiles(new Set(result.revealedTiles));

          // Track if this tile is a mine
          if (result.isMine) {
            setMineTiles((prev) => new Set([...prev, tileIndex]));
          }

          // Remove from flipping tiles after reveal
          setFlippingTiles((prev) => {
            const newSet = new Set(prev);
            newSet.delete(tileIndex);
            return newSet;
          });

          // Update local game state
          setBackendGame((prev) =>
            prev
              ? {
                  ...prev,
                  gameState: result.gameState as any,
                  tilesRevealed: result.tilesRevealed,
                  revealedTiles: result.revealedTiles,
                }
              : null,
          );

          if (result.gameComplete) {
            if (result.isMine) {
              toast.error("Mine hit! Game Over!", {
                description: "Better luck next time!",
              });
              // Reload user data to get final game state with mine positions
              await loadUserData();
            } else if (result.gameState === "PERFECT") {
              toast.success("Perfect game!", {
                description: "All safe tiles revealed!",
              });
              // Reload user data
              await loadUserData();
            }
          } else {
            if (result.isMine) {
              toast.error("Mine hit!", {
                description: "Game over",
              });
            } else {
              toast.success("Safe tile!", {
                description: "Keep going!",
              });
            }
          }
        }
      }, 600);
    } catch (error: any) {
      console.error("Error revealing tile:", error);

      // Check if it's a blockchain nonce error
      if (error.message?.includes("nonce") || error.code === "NONCE_EXPIRED") {
        toast.error("Backend blockchain error", {
          description:
            "The backend is having blockchain issues. This should be a backend-only operation.",
        });
      } else {
        toast.error("Error revealing tile", {
          description:
            error.response?.data?.error || error.message || "Unknown error",
        });
      }

      // Remove from flipping tiles on error
      setFlippingTiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(tileIndex);
        return newSet;
      });
    }
  };

  // Cash out with wagmi integration
  const cashOut = async (): Promise<void> => {
    if (!backendGame || loading || !address) return;

    setLoading(true);
    setMessage("Extracting your rewards...");

    try {
      // Step 1: Update backend to CASHED_OUT state
      const gameId = backendGame.id;
      const cashoutResponse = await axiosClient.post(`mine/cashout/${gameId}`);

      const cashoutResult = cashoutResponse.data;

      if (!cashoutResult.success) {
        throw new Error(cashoutResult.error || "Backend cashout failed");
      }

      setMessage("Securing your mining profits...");

      // Step 2: Set transaction type and call blockchain requestCashOut
      const blockchainGameId = backendGame.blockchainGameId;
      if (!blockchainGameId) {
        throw new Error("No blockchain game ID found");
      }

      setPendingTxType("cashOut");
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: MINEGAME_ABI,
        functionName: "requestCashOut",
        args: [BigInt(blockchainGameId)],
      });
    } catch (error: any) {
      console.error("Cash out error:", error);
      toast.error("Cash out failed", {
        description: error.message,
      });
      setLoading(false);
      setPendingTxType(null);
    }
  };

  // New processCashOut function to handle cash out confirmations
  const processCashOut = async (): Promise<void> => {
    if (!receipt || !hash) return;

    try {
      setMessage("Mining rewards confirmed...");

      // Clear local game state
      setBackendGame(null);
      setRevealedTiles(new Set());
      setMineTiles(new Set());
      setFlippingTiles(new Set());
      setMessage("Successfully cashed out!");

      toast.success("Cash out confirmed!", {
        description: "Your winnings have been processed on the blockchain.",
      });

      // Reload user data
      await loadUserData();
    } catch (error: any) {
      console.error("Error processing cash out confirmation:", error);
      toast.error("Cash out confirmation failed", {
        description: error.message,
      });
    }

    setLoading(false);
  };

  // Connection status component
  const ConnectionStatus = () => {
    if (!isClient) return null;

    if (!isConnected) {
      return (
        <div className="backdrop-blur-[60px] bg-red-500/20 border-2 rounded-3xl border-red-500/40 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-red-300 font-semibold">⚠️ Wallet Required</h3>
              <p className="text-red-200 text-sm">
                Please connect your wallet to start playing mine games.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return null; // Remove connected status to match flip page
  };

  // Render game board with flip animations
  const renderGameBoard = () => {
    if (!backendGame) return null;

    const tiles = Array.from({ length: backendGame.boardSize }, (_, i) => {
      const isRevealed = revealedTiles.has(i);
      const isMine = mineTiles.has(i);
      const isFlipping = flippingTiles.has(i);
      const isGameEnded = backendGame.gameState !== "PLAYING";
      const isDisabled = isRevealed || (!isGameEnded && isFlipping);

      return (
        <div key={i} className="relative" style={{ perspective: "1000px" }}>
          <button
            disabled={isDisabled}
            onClick={() => (!isGameEnded ? revealTile(i) : null)}
            className={`
              w-12 h-12 sm:w-16 sm:h-16 md:w-20  md:h-20 lg:w-24 lg:h-24 relative transition-all duration-200 preserve-3d
              ${isGameEnded ? "cursor-default" : isDisabled && !isFlipping ? "cursor-not-allowed opacity-20" : "cursor-pointer hover:scale-105"}
              ${isFlipping ? "tile-flipping" : ""}
            `}
            style={{
              transformStyle: "preserve-3d",
              transform:
                isRevealed && !isFlipping ? "rotateY(180deg)" : "rotateY(0deg)",
              transition: !isFlipping
                ? "transform 600ms cubic-bezier(0.4, 0, 0.2, 1)"
                : "none",
            }}
          >
            {/* Front side (unrevealed) */}
            <div
              className="absolute bg-accent-primary inset-0 w-full h-full border-2 sm:border-3 border-translucent-light-4 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center backface-hidden text-white font-black text-xs sm:text-sm md:text-base lg:text-xl"
              style={{
                backfaceVisibility: "hidden",
                boxShadow:
                  "0 2px 6px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
              }}
            >
              <Image
                src="/icons/Banana.svg"
                alt="Banana"
                width={24}
                height={24}
                className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-12 lg:h-12 drop-shadow-lg"
              />
            </div>
            <div
              className={`absolute inset-0 w-full h-full border-2 sm:border-3 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center backface-hidden font-black text-sm sm:text-base md:text-lg lg:text-2xl ${
                isMine
                  ? "bg-red-500 border-red-400 text-white"
                  : "bg-accent-secondary border-[#E0A429] text-dark-primary"
              }`}
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                boxShadow: isMine
                  ? "0 2px 8px rgba(239, 68, 68, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.25)"
                  : "0 2px 8px rgba(245, 186, 49, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.25)",
              }}
            >
              {isMine ? (
                <Image
                  src="/mine.svg"
                  alt="Mine"
                  width={24}
                  height={24}
                  className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-12 lg:h-12 drop-shadow-lg"
                />
              ) : (
                <Image
                  src="/icons/Butt.svg"
                  alt="Mine"
                  width={24}
                  height={24}
                  className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-12 lg:h-12 drop-shadow-lg"
                />
              )}
            </div>
          </button>

          {/* Glow effect for flipping tile */}
          {isFlipping && (
            <div
              className="absolute inset-0 rounded-xl glow-animation pointer-events-none"
              style={{ zIndex: -1 }}
            />
          )}
        </div>
      );
    });

    return (
      <div className="flex justify-center mt-4 sm:mt-6 md:mt-8">
        <div className="grid grid-cols-5 gap-2 sm:gap-3 md:gap-4 lg:gap-5 w-full max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl">
          {tiles}
        </div>

        {/* CSS for flip animations */}
        <style jsx>{`
          .preserve-3d {
            transform-style: preserve-3d;
          }

          .backface-hidden {
            backface-visibility: hidden;
          }

          @keyframes tile-flip {
            0% {
              transform: rotateY(0deg) scale(1);
            }
            25% {
              transform: rotateY(45deg) scale(1.05);
            }
            50% {
              transform: rotateY(90deg) scale(1.1);
            }
            75% {
              transform: rotateY(135deg) scale(1.05);
            }
            100% {
              transform: rotateY(180deg) scale(1);
            }
          }

          .tile-flipping {
            animation: tile-flip 600ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }

          @keyframes glow-pulse {
            0%,
            100% {
              box-shadow: 0 0 10px rgba(245, 186, 49, 0.5);
            }
            50% {
              box-shadow:
                0 0 30px rgba(245, 186, 49, 0.8),
                0 0 40px rgba(245, 186, 49, 0.6);
            }
          }

          .glow-animation {
            animation: glow-pulse 1s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  };

  // Render user stats
  const renderStats = () => {
    if (!userStats)
      return (
        <div className="text-translucent-light-64 text-center">
          No stats available
        </div>
      );

    const winRate =
      userStats.gamesPlayed > 0
        ? ((userStats.gamesWon / userStats.gamesPlayed) * 100).toFixed(1)
        : "0";

    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="p-4 rounded-2xl bg-translucent-dark-24 border border-translucent-light-4">
          <h4 className="font-semibold text-translucent-light-64 text-sm">
            Games Played
          </h4>
          <p className="text-2xl font-bold text-white">
            {userStats.gamesPlayed}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-translucent-dark-24 border border-translucent-light-4">
          <h4 className="font-semibold text-translucent-light-64 text-sm">
            Win Rate
          </h4>
          <p className="text-2xl font-bold text-white">{winRate}%</p>
        </div>
        <div className="p-4 rounded-2xl bg-translucent-dark-24 border border-translucent-light-4">
          <h4 className="font-semibold text-translucent-light-64 text-sm">
            Perfect Games
          </h4>
          <p className="text-2xl font-bold text-white">
            {userStats.gamesPerfect}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-translucent-dark-24 border border-translucent-light-4">
          <h4 className="font-semibold text-translucent-light-64 text-sm">
            Best Streak
          </h4>
          <p className="text-2xl font-bold text-white">
            {userStats.bestWinStreak}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-translucent-dark-24 border border-translucent-light-4">
          <h4 className="font-semibold text-translucent-light-64 text-sm">
            Total Mines Hit
          </h4>
          <p className="text-2xl font-bold text-white">
            {userStats.totalMinesHit}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-translucent-dark-24 border border-translucent-light-4">
          <h4 className="font-semibold text-translucent-light-64 text-sm">
            Current Streak
          </h4>
          <p className="text-2xl font-bold text-white">
            {userStats.currentWinStreak}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-translucent-dark-24 border border-translucent-light-4">
          <h4 className="font-semibold text-translucent-light-64 text-sm">
            Tiles Revealed
          </h4>
          <p className="text-2xl font-bold text-white">
            {userStats.totalTilesRevealed}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-translucent-dark-24 border border-translucent-light-4">
          <h4 className="font-semibold text-translucent-light-64 text-sm">
            Best Game
          </h4>
          <p className="text-2xl font-bold text-white">
            {userStats.highestTilesInGame}
          </p>
        </div>
      </div>
    );
  };

  // Render game history
  const renderHistory = () => {
    if (!gameHistory)
      return (
        <div className="text-translucent-light-64 text-center">
          No history available
        </div>
      );

    const getStateColor = (state: string) => {
      switch (state) {
        case "CASHED_OUT":
          return "text-green-300 bg-green-500/20 border-green-500/40";
        case "PERFECT":
          return "text-purple-300 bg-purple-500/20 border-purple-500/40";
        case "EXPLODED":
          return "text-red-300 bg-red-500/20 border-red-500/40";
        default:
          return "text-gray-300 bg-gray-500/20 border-gray-500/40";
      }
    };

    return (
      <div>
        <div className="space-y-4">
          {gameHistory.games.map((game) => (
            <div
              key={game.id}
              className="p-4 rounded-2xl bg-translucent-dark-24 border border-translucent-light-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-3 py-1 rounded-xl text-sm font-medium border ${getStateColor(game.gameState)}`}
                    >
                      {game.gameState}
                    </span>
                    <span className="text-sm text-translucent-light-64">
                      {game.mineCount} mines
                    </span>
                  </div>
                  <p className="text-sm text-white">
                    Tiles Revealed: {game.tilesRevealed} / {25 - game.mineCount}
                  </p>
                  <p className="text-sm text-translucent-light-64">
                    {game.createdAt
                      ? new Date(game.createdAt).toLocaleString()
                      : "Unknown date"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">
                    {parseFloat(game.betAmount).toFixed(4)} ETH
                  </p>
                  {game.blockchainGameId && (
                    <p className="text-xs text-translucent-light-64">
                      #{game.blockchainGameId}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {gameHistory.pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              disabled={historyPage === 1 || loading}
              onClick={() =>
                address && loadGameHistory(address, historyPage - 1)
              }
              className="px-4 py-2 bg-translucent-dark-24 border border-translucent-light-4 rounded-xl text-white disabled:opacity-50 hover:bg-translucent-light-8 transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-white">
              Page {gameHistory.pagination.page} of{" "}
              {gameHistory.pagination.pages}
            </span>
            <button
              disabled={historyPage === gameHistory.pagination.pages || loading}
              onClick={() =>
                address && loadGameHistory(address, historyPage + 1)
              }
              className="px-4 py-2 bg-translucent-dark-24 border border-translucent-light-4 rounded-xl text-white disabled:opacity-50 hover:bg-translucent-light-8 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  };

  const isGameDisabled = !isConnected || loading || isWritePending;
  const getStartButtonText = () => {
    if (!isConnected) return "Connect Wallet to Play";
    if (isWritePending) return "Waiting for wallet...";
    if (loading) return "Starting...";
    return `Start Game (${gameFee} ETH)`;
  };

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <ConnectionStatus />

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="backdrop-blur-[60px] bg-translucent-dark-12 border-2 rounded-3xl border-translucent-light-4 p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold text-white mb-4">
                Confirm Game Start
              </h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-translucent-light-64">Mines:</span>
                  <span className="text-white font-semibold">{mineCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-translucent-light-64">Bet Amount:</span>
                  <span className="text-white font-semibold">
                    {gameFee} ETH
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-translucent-light-64">Board Size:</span>
                  <span className="text-white font-semibold">
                    5x5 (25 tiles)
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 px-4 py-2 rounded-xl font-semibold bg-translucent-light-8 text-white hover:bg-translucent-light-16 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={startGame}
                  className="flex-1 px-4 py-2 rounded-xl font-semibold bg-[#F5BA31] text-dark-primary hover:bg-[#E0A429] transition-colors"
                >
                  Confirm & Start
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Layout */}
        {isConnected && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Game Section - Takes up more space */}
            <div className="lg:col-span-2">
              {/* Game Tab always visible */}
              <div className="backdrop-blur-[60px] bg-translucent-dark-12 border-2 rounded-2xl lg:rounded-3xl border-translucent-light-4 p-4 lg:p-6">
                <h2 className="text-xl lg:text-2xl font-bold text-white mb-4 lg:mb-6">
                  Mine Game
                </h2>

                {/* Game Setup */}
                {!backendGame && (
                  <div className="mb-4 lg:mb-6">
                    <h3 className="mb-3 lg:mb-4 text-lg lg:text-xl font-semibold text-white">
                      Start New Game
                    </h3>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                      <label className="font-semibold text-white text-sm lg:text-base">
                        Mine Count:
                      </label>
                      <select
                        value={mineCount}
                        onChange={(e) => setMineCount(Number(e.target.value))}
                        className="px-3 py-2 bg-translucent-dark-24 border border-translucent-light-4 rounded-xl text-white focus:outline-none focus:border-[#F5BA31] text-sm lg:text-base"
                        disabled={isGameDisabled}
                      >
                        {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                          <option
                            key={n}
                            value={n}
                            className="bg-dark-primary text-white"
                          >
                            {n} mines
                          </option>
                        ))}
                      </select>
                      <button
                        disabled={isGameDisabled}
                        onClick={showGameConfirmation}
                        className={`px-4 lg:px-6 py-2 rounded-xl font-semibold transition-colors text-sm lg:text-base flex-1 sm:flex-none ${
                          isGameDisabled
                            ? "bg-translucent-light-8 text-gray-200 cursor-not-allowed"
                            : "bg-[#F5BA31] text-dark-primary hover:bg-[#E0A429]"
                        }`}
                      >
                        {getStartButtonText()}
                      </button>
                    </div>
                  </div>
                )}

                {/* Active Game */}
                {backendGame && (
                  <div>
                    {/* Compact Game Info */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4 mb-4 lg:mb-6">
                      <div className="text-center">
                        <span className="text-translucent-light-64 block text-xs lg:text-sm">
                          Mines
                        </span>
                        <span className="font-bold text-white text-base lg:text-lg">
                          {backendGame.mineCount}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="text-translucent-light-64 block text-xs lg:text-sm">
                          Revealed
                        </span>
                        <span className="font-bold text-white text-base lg:text-lg">
                          {backendGame.tilesRevealed}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="text-translucent-light-64 block text-xs lg:text-sm">
                          State
                        </span>
                        <span className="font-bold text-white text-base lg:text-lg">
                          {backendGame.gameState}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="text-translucent-light-64 block text-xs lg:text-sm">
                          Safe Left
                        </span>
                        <span className="font-bold text-white text-base lg:text-lg">
                          {25 -
                            backendGame.mineCount -
                            backendGame.tilesRevealed}
                        </span>
                      </div>
                    </div>

                    {/* Game Board */}
                    {renderGameBoard()}

                    {/* Game Controls */}
                    {backendGame.gameState === "PLAYING" && (
                      <div className="mt-6">
                        <button
                          disabled={loading || backendGame.tilesRevealed === 0}
                          onClick={cashOut}
                          className={`w-full px-6 py-3 rounded-xl font-semibold transition-colors ${
                            loading || backendGame.tilesRevealed === 0
                              ? "bg-translucent-light-8 text-gray-200 cursor-not-allowed"
                              : "bg-[#F5BA31] text-dark-primary hover:bg-[#E0A429]"
                          }`}
                        >
                          {loading ? "Cashing Out..." : "Cash Out"}
                        </button>

                        {backendGame.tilesRevealed === 0 && (
                          <p className="text-center text-sm text-translucent-light-64 mt-2">
                            Reveal at least one tile to cash out
                          </p>
                        )}
                      </div>
                    )}

                    {/* Game End States */}
                    {backendGame.gameState !== "PLAYING" && (
                      <div className="mt-6 p-4 bg-translucent-dark-24 border border-translucent-light-4 rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-white font-semibold">
                            Game Ended: {backendGame.gameState}
                          </span>
                          <span className="text-translucent-light-64">
                            Tiles: {backendGame.tilesRevealed}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setBackendGame(null);
                            setRevealedTiles(new Set());
                            setMineTiles(new Set());
                            setFlippingTiles(new Set());
                            setMessage("");
                          }}
                          className="w-full px-4 py-2 rounded-xl font-semibold bg-[#F5BA31] text-dark-primary hover:bg-[#E0A429] transition-colors"
                        >
                          Start New Game
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Stats and History */}
            <div className="space-y-6">
              {/* Stats Section */}
              <div className="backdrop-blur-[60px] bg-translucent-dark-12 border-2 rounded-3xl border-translucent-light-4 p-4">
                <h3 className="text-h5 font-semibold text-white mb-4">
                  Statistics
                </h3>
                <div className="space-y-3">
                  {userStats && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-translucent-light-64 text-sm">
                          Games
                        </span>
                        <span className="text-white font-semibold">
                          {userStats.gamesPlayed}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-translucent-light-64 text-sm">
                          Win Rate
                        </span>
                        <span className="text-white font-semibold">
                          {userStats.gamesPlayed > 0
                            ? (
                                (userStats.gamesWon / userStats.gamesPlayed) *
                                100
                              ).toFixed(1)
                            : "0"}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-translucent-light-64 text-sm">
                          Perfect
                        </span>
                        <span className="text-white font-semibold">
                          {userStats.gamesPerfect}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-translucent-light-64 text-sm">
                          Best Streak
                        </span>
                        <span className="text-white font-semibold">
                          {userStats.bestWinStreak}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Recent History */}
              <div className="backdrop-blur-[60px] bg-translucent-dark-12 border-2 rounded-3xl border-translucent-light-4 p-4">
                <h3 className="text-h5 font-semibold text-white mb-4">
                  Recent Games
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {gameHistory?.games.slice(0, 5).map((game) => (
                    <div
                      key={game.id}
                      className="p-3 bg-translucent-dark-24 border border-translucent-light-4 rounded-xl"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            game.gameState === "CASHED_OUT"
                              ? "text-green-300 bg-green-500/20"
                              : game.gameState === "PERFECT"
                                ? "text-purple-300 bg-purple-500/20"
                                : "text-red-300 bg-red-500/20"
                          }`}
                        >
                          {game.gameState}
                        </span>
                        <span className="text-xs text-translucent-light-64">
                          {game.mineCount} mines
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-translucent-light-64">
                          {game.tilesRevealed} tiles
                        </span>
                        <span className="text-white font-medium">
                          {parseFloat(game.betAmount).toFixed(4)} ETH
                        </span>
                      </div>
                    </div>
                  )) || (
                    <div className="text-translucent-light-64 text-sm text-center">
                      No games yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {message && (
          <div className="fixed bottom-4 right-4 z-50">
            <div
              className={`backdrop-blur-[60px] p-3 rounded-xl border-2 max-w-sm ${
                message.includes("Error") || message.includes("failed")
                  ? "bg-red-500/20 text-red-300 border-red-500/40"
                  : message.includes("successfully") ||
                      message.includes("started")
                    ? "bg-green-500/20 text-green-300 border-green-500/40"
                    : "bg-blue-500/20 text-blue-300 border-blue-500/40"
              }`}
            >
              <p className="text-sm">{message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
