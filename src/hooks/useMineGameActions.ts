import { useCallback } from "react";
import { parseEther, decodeEventLog } from "viem";
import { toast } from "sonner";
import axiosClient from "@/lib/axios";
import { MINEGAME_ABI } from "@/lib/mine-abi";
import { RevealResponse, Game, TransactionType } from "@/types/mine";
import { CONTRACT_ADDRESS, ANIMATION_TIMING } from "@/constants/mine";

interface MineGameActionsParams {
  address?: string;
  isConnected: boolean;
  backendGame: Game | null;
  mineCount: number;
  gameFee: string;
  loading: boolean;
  pendingTxType: TransactionType;
  receipt: unknown;
  hash: string | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  writeContract: (args: any) => void;
  flippingTiles: Set<number>;
  setLoading: (loading: boolean) => void;
  setMessage: (message: string) => void;
  setPendingTxType: (type: TransactionType) => void;
  setShowConfirmation: (show: boolean) => void;
  setShowTransactionLoading: (show: boolean) => void;
  setShowExplosionDialog: (show: boolean) => void;
  setRevealedTiles: (tiles: Set<number> | ((prev: Set<number>) => Set<number>)) => void;
  setMineTiles: (tiles: Set<number> | ((prev: Set<number>) => Set<number>)) => void;
  setFlippingTiles: (tiles: Set<number> | ((prev: Set<number>) => Set<number>)) => void;
  setBackendGame: (game: Game | null | ((prev: Game | null) => Game | null)) => void;
  resetGame: () => void;
  loadUserData: () => Promise<void>;
  getXPCalculation: (gameId: string) => Promise<void>;
}

export const useMineGameActions = (params: MineGameActionsParams) => {
  const {
    address,
    isConnected,
    backendGame,
    mineCount,
    gameFee,
    loading,
    receipt,
    hash,
    writeContract,
    flippingTiles,
    setLoading,
    setMessage,
    setPendingTxType,
    setShowConfirmation,
    setShowTransactionLoading,
    setShowExplosionDialog,
    setRevealedTiles,
    setMineTiles,
    setFlippingTiles,
    setBackendGame,
    resetGame,
    loadUserData,
    getXPCalculation,
  } = params;

  const showGameConfirmation = useCallback((): void => {
    if (!address || !isConnected) {
      toast.error("Wallet not connected", {
        description: "Please connect your wallet to start playing.",
      });
      return;
    }
    setShowConfirmation(true);
  }, [address, isConnected, setShowConfirmation]);

  const startGame = useCallback(async (): Promise<void> => {
    setShowConfirmation(false);
    setShowTransactionLoading(true);
    setLoading(true);

    try {
      setRevealedTiles(new Set());
      setMineTiles(new Set());
      setFlippingTiles(new Set());

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
      setShowTransactionLoading(false);
      setPendingTxType("startGame");

      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: MINEGAME_ABI,
        functionName: "startGame",
        args: [mineCount],
        value: parseEther(gameFee),
      });
    } catch (error: unknown) {
      console.error("Start game error:", error);
      setShowTransactionLoading(false);
      const errorObj = error as { message?: string };
      toast.error("Failed to start game", {
        description: errorObj.message || "Unknown error",
      });
      setLoading(false);
      setPendingTxType(null);
    }
  }, [
    address,
    mineCount,
    gameFee,
    writeContract,
    setShowConfirmation,
    setShowTransactionLoading,
    setLoading,
    setRevealedTiles,
    setMineTiles,
    setFlippingTiles,
    setBackendGame,
    setPendingTxType,
  ]);

  const revealTile = useCallback(async (tileIndex: number): Promise<void> => {
    if (!backendGame || flippingTiles.has(tileIndex) || !address) return;

    setFlippingTiles((prev) => new Set([...prev, tileIndex]));

    try {
      const gameId = backendGame.blockchainGameId || backendGame.id;
      const response = await axiosClient.post(
        `mine/reveal/${gameId}/${tileIndex}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const result: RevealResponse = response.data;

      setTimeout(async () => {
        if (!result.success) {
          toast.error("Reveal failed", {
            description: (result as { error?: string }).error || "Could not reveal tile",
          });
          setFlippingTiles((prev) => {
            const newSet = new Set(prev);
            newSet.delete(tileIndex);
            return newSet;
          });
        } else {
          setRevealedTiles(new Set(result.revealedTiles));

          if (result.isMine) {
            setMineTiles((prev) => new Set([...prev, tileIndex]));
          }

          setFlippingTiles((prev) => {
            const newSet = new Set(prev);
            newSet.delete(tileIndex);
            return newSet;
          });

          setBackendGame((prev) =>
            prev
              ? {
                  ...prev,
                  gameState: result.gameState as "WAITING" | "PLAYING" | "CASHED_OUT" | "EXPLODED" | "PERFECT",
                  tilesRevealed: result.tilesRevealed,
                  revealedTiles: result.revealedTiles,
                }
              : null,
          );

          if (result.gameComplete) {
            if (result.isMine) {
              setShowExplosionDialog(true);
              setTimeout(async () => {
                await loadUserData();
                if (backendGame?.id) {
                  await getXPCalculation(backendGame.id);
                }
              }, ANIMATION_TIMING.EXPLOSION_DELAY);
            } else if (result.gameState === "PERFECT") {
              toast.success("Perfect game!", {
                description: "All safe tiles revealed!",
              });
              await loadUserData();
              if (backendGame?.id) {
                await getXPCalculation(backendGame.id);
              }
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
      }, ANIMATION_TIMING.TILE_FLIP);
    } catch (error: unknown) {
      console.error("Error revealing tile:", error);
      
      const errorObj = error as { message?: string; code?: string; response?: { data?: { error?: string } } };
      if (errorObj.message?.includes("nonce") || errorObj.code === "NONCE_EXPIRED") {
        toast.error("Backend blockchain error", {
          description: "The backend is having blockchain issues. This should be a backend-only operation.",
        });
      } else {
        toast.error("Error revealing tile", {
          description: errorObj.response?.data?.error || errorObj.message || "Unknown error",
        });
      }

      setFlippingTiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(tileIndex);
        return newSet;
      });
    }
  }, [
    backendGame,
    flippingTiles,
    address,
    setFlippingTiles,
    setRevealedTiles,
    setMineTiles,
    setBackendGame,
    setShowExplosionDialog,
    loadUserData,
    getXPCalculation,
  ]);

  const cashOut = useCallback(async (): Promise<void> => {
    if (!backendGame || loading || !address) return;

    setLoading(true);
    setMessage("Extracting your rewards...");

    try {
      const gameId = backendGame.id;
      const cashoutResponse = await axiosClient.post(`mine/cashout/${gameId}`);

      const cashoutResult = cashoutResponse.data;

      if (!cashoutResult.success) {
        throw new Error(cashoutResult.error || "Backend cashout failed");
      }

      setMessage("Securing your mining profits...");

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
    } catch (error: unknown) {
      console.error("Cash out error:", error);
      const errorObj = error as { message?: string };
      toast.error("Cash out failed", {
        description: errorObj.message || "Unknown error",
      });
      setLoading(false);
      setPendingTxType(null);
    }
  }, [backendGame, loading, address, setLoading, setMessage, setPendingTxType, writeContract]);

  const processGameStart = useCallback(async (): Promise<void> => {
    if (!receipt || !hash) return;

    try {
      setMessage("Connecting to mining network...");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const logs = (receipt as any).logs;
      let blockchainGameId = null;

      for (const log of logs) {
        try {
          if (log.address.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()) {
            const parsedLog = decodeEventLog({
              abi: MINEGAME_ABI,
              topics: log.topics,
              data: log.data,
              eventName: "GameStarted",
            });

            if (
              parsedLog &&
              parsedLog.eventName === "GameStarted" &&
              parsedLog.args
            ) {
              blockchainGameId = parsedLog.args.gameId.toString();
              break;
            }
          }
        } catch {
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
              break;
            }
          } catch {
            continue;
          }
        }
      }

      if (blockchainGameId && backendGame) {
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
            description: "The game was created but linking failed. Refreshing game state...",
          });
          if (address) {
            await loadUserData();
          }
        }
      } else {
        toast.warning("Event parsing issue", {
          description: "Game may have started. Checking backend state...",
        });
        if (address) {
          await loadUserData();
          setMessage("Scanning mining tunnels...");
        }
      }
    } catch (error) {
      console.error("Error processing game start:", error);
      toast.error("Game processing failed", {
        description: "There was an error processing the game. Checking backend state...",
      });
      if (address) {
        try {
          await loadUserData();
          setMessage("Mining operation recovered successfully");
        } catch {
          setMessage("Mining equipment malfunction. Please refresh the page.");
        }
      }
    }

    setLoading(false);
  }, [receipt, hash, backendGame, address, setMessage, setBackendGame, setLoading, loadUserData]);

  const processCashOut = useCallback(async (): Promise<void> => {
    if (!receipt || !hash) return;

    try {
      setMessage("Mining rewards confirmed...");

      resetGame();
      setMessage("Successfully cashed out!");

      toast.success("Cash out confirmed!", {
        description: "Your winnings have been processed on the blockchain.",
      });

      await loadUserData();

      if (backendGame?.id) {
        await getXPCalculation(backendGame.id);
      }
    } catch (error: unknown) {
      console.error("Error processing cash out confirmation:", error);
      const errorObj = error as { message?: string };
      toast.error("Cash out confirmation failed", {
        description: errorObj.message || "Unknown error",
      });
    }

    setLoading(false);
  }, [receipt, hash, resetGame, setMessage, setLoading, loadUserData, backendGame, getXPCalculation]);

  return {
    showGameConfirmation,
    startGame,
    revealTile,
    cashOut,
    processGameStart,
    processCashOut,
  };
};