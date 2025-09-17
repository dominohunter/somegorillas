import { useState, useEffect, useCallback } from "react";
import { useAccount, useWaitForTransactionReceipt, useWriteContract, useReadContract } from "wagmi";
import { formatEther } from "viem";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import axiosClient from "@/lib/axios";
import { MINEGAME_ABI } from "@/lib/mine-abi";
import { Game, GameStats, GameHistory, XPCalculation, TransactionType } from "@/types/mine";
import { CONTRACT_ADDRESS, DEFAULT_GAME_FEE } from "@/constants/mine";

export const useMineGame = () => {
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
  const [pendingTxType, setPendingTxType] = useState<TransactionType>(null);

  // Dialog states
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [showExplosionDialog, setShowExplosionDialog] = useState<boolean>(false);
  const [showTransactionLoading, setShowTransactionLoading] = useState<boolean>(false);
  const [showXPDialog, setShowXPDialog] = useState<boolean>(false);
  const [xpData, setXpData] = useState<XPCalculation | null>(null);

  // Data states
  const [gameHistory, setGameHistory] = useState<GameHistory | null>(null);
  const [userStats, setUserStats] = useState<GameStats | null>(null);

  // Blockchain hooks
  const {
    data: hash,
    error: writeError,
    writeContract,
    isPending: isWritePending,
  } = useWriteContract();

  const { isSuccess: isConfirmed, data: receipt } = useWaitForTransactionReceipt({
    hash,
    confirmations: 1,
  });

  // Read game fee
  const { data: gameFeeData } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: MINEGAME_ABI,
    functionName: "gameFee",
    query: {
      enabled: isConnected && !!address,
    },
  });

  // Load user data
  const loadUserData = useCallback(async () => {
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
  }, [address]);

  const loadActiveGame = useCallback(async (userAddress: string): Promise<void> => {
    try {
      const response = await axiosClient.get(`mine/active/${userAddress}`);
      const data = response.data;

      if (data.success && data.game) {
        setBackendGame(data.game);
        setRevealedTiles(new Set(data.game.revealedTiles || []));

        if (data.game.gameState !== "PLAYING" && data.game.minePositions) {
          setMineTiles((prev) => {
            const existingMines = Array.from(prev);
            const allMines = [...existingMines, ...data.game.minePositions];
            return new Set(allMines);
          });
          const allRevealedTiles = new Set([
            ...(data.game.revealedTiles || []),
            ...(data.game.minePositions || []),
          ]);
          setRevealedTiles(allRevealedTiles);
        } else {
          setMineTiles(new Set());
        }
      }
    } catch (err) {
      console.error("Failed to load active game:", err);
    }
  }, []);

  const loadUserStats = useCallback(async (userAddress: string): Promise<void> => {
    try {
      const response = await axiosClient.get(`mine/stats/${userAddress}`);
      const data = response.data;

      if (data.success) {
        setUserStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to load user stats:", err);
    }
  }, []);

  const loadGameHistory = useCallback(async (userAddress: string, page: number = 1): Promise<void> => {
    try {
      const response = await axiosClient.get(
        `mine/history/${userAddress}?page=${page}&limit=10`,
      );
      const data = response.data;

      if (data.success) {
        setGameHistory(data);
      }
    } catch (err) {
      console.error("Failed to load game history:", err);
    }
  }, []);

  const getXPCalculation = useCallback(async (gameId: string): Promise<void> => {
    try {
      let response;
      try {
        response = await axiosClient.get(`mine/xp/${gameId}`);
      } catch {
        try {
          response = await axiosClient.post(`mine/xp/${gameId}`);
        } catch {
          response = await axiosClient.get(`mine/${gameId}`);
        }
      }

      const data = response.data;

      if (data.success) {
        setXpData(data);
        setShowXPDialog(true);
        queryClient.invalidateQueries({ queryKey: ["stats", "user"] });
      }
    } catch (err) {
      console.error("Failed to get XP calculation:", err);
    }
  }, [queryClient]);

  const resetGame = useCallback(() => {
    setBackendGame(null);
    setRevealedTiles(new Set());
    setMineTiles(new Set());
    setFlippingTiles(new Set());
    setMessage("");
  }, []);

  // Effects
  useEffect(() => {
    if (gameFeeData) {
      const feeInEth = formatEther(gameFeeData as bigint);
      setGameFee(feeInEth);
    } else if (isConnected) {
      setGameFee(DEFAULT_GAME_FEE);
    }
  }, [gameFeeData, isConnected]);

  useEffect(() => {
    if (isConnected && address) {
      loadUserData();
    }
  }, [isConnected, address, loadUserData]);

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
          description: "You don't have enough ETH to complete this transaction.",
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

  return {
    // State
    mineCount,
    setMineCount,
    gameFee,
    backendGame,
    revealedTiles,
    mineTiles,
    flippingTiles,
    loading,
    setLoading,
    message,
    setMessage,
    pendingTxType,
    setPendingTxType,
    gameHistory,
    userStats,
    xpData,
    setXpData,

    // Dialog states
    showConfirmation,
    setShowConfirmation,
    showExplosionDialog,
    setShowExplosionDialog,
    showTransactionLoading,
    setShowTransactionLoading,
    showXPDialog,
    setShowXPDialog,

    // Blockchain
    hash,
    writeError,
    writeContract,
    isWritePending,
    isConfirmed,
    receipt,
    isConnected,
    address,

    // Methods
    loadUserData,
    loadActiveGame,
    loadUserStats,
    loadGameHistory,
    getXPCalculation,
    resetGame,
    setRevealedTiles,
    setMineTiles,
    setFlippingTiles,
    setBackendGame,
  };
};