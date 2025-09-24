"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GlareButton } from "@/components/ui/glare-button";
import { useMineGame } from "@/hooks/useMineGame";
import { useMineGameActions } from "@/hooks/useMineGameActions";
import { useStats } from "@/lib/query-helper";
import { pendingTransactionsApi } from "@/lib/api";

import { ConnectionStatus } from "@/components/mine/ConnectionStatus";
import { GameControls } from "@/components/mine/GameControls";
import { GameInfo } from "@/components/mine/GameInfo";
import { GameBoard } from "@/components/mine/GameBoard";
import { CashOutSection } from "@/components/mine/CashOutSection";
import { StatsSection } from "@/components/mine/StatsSection";
import { GameHistorySection } from "@/components/mine/GameHistorySection";
import { StatusMessage } from "@/components/mine/StatusMessage";

import {
  ConfirmationDialog,
  ExplosionDialog,
  TransactionLoadingDialog,
  XPDialog,
} from "@/components/mine/dialogs";

export default function EnhancedMineGameApp() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [showMines, setShowMines] = useState(false);
  const mineGame = useMineGame();
  const mineGameActions = useMineGameActions({
    address: mineGame.address,
    isConnected: mineGame.isConnected,
    backendGame: mineGame.backendGame,
    mineCount: mineGame.mineCount,
    gameFee: mineGame.gameFee,
    loading: mineGame.loading,
    pendingTxType: mineGame.pendingTxType,
    receipt: mineGame.receipt,
    hash: mineGame.hash,
    writeContract: mineGame.writeContract,
    flippingTiles: mineGame.flippingTiles,
    setLoading: mineGame.setLoading,
    setMessage: mineGame.setMessage,
    setPendingTxType: mineGame.setPendingTxType,
    setShowConfirmation: mineGame.setShowConfirmation,
    setShowTransactionLoading: mineGame.setShowTransactionLoading,
    setShowExplosionDialog: mineGame.setShowExplosionDialog,
    setRevealedTiles: mineGame.setRevealedTiles,
    setMineTiles: mineGame.setMineTiles,
    setFlippingTiles: mineGame.setFlippingTiles,
    setBackendGame: mineGame.setBackendGame,
    resetGame: mineGame.resetGame,
    loadUserData: mineGame.loadUserData,
    getXPCalculation: mineGame.getXPCalculation,
  });

  // Get user stats for total XP
  const userStatsQuery = useStats();

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle pending transaction creation when hash becomes available
  useEffect(() => {
    if (mineGame.hash && mineGame.pendingTxType && !mineGame.isConfirmed) {
      const createPendingTransaction = async () => {
        try {
          await pendingTransactionsApi.createPendingTransaction(
            mineGame.hash!,
            "minegame",
          );
          console.log("Pending transaction created for hash:", mineGame.hash);
        } catch (error) {
          console.error("Failed to create pending transaction:", error);
          // Don't fail the entire flow if pending transaction creation fails
        }
      };

      createPendingTransaction();
    }
  }, [mineGame.hash, mineGame.pendingTxType, mineGame.isConfirmed]);

  // Handle transaction confirmation
  useEffect(() => {
    if (
      mineGame.isConfirmed &&
      mineGame.receipt &&
      mineGame.hash &&
      mineGame.pendingTxType
    ) {
      if (mineGame.pendingTxType === "startGame") {
        mineGameActions.processGameStart();
      } else if (mineGame.pendingTxType === "cashOut") {
        mineGameActions.processCashOut();
      }
      mineGame.setPendingTxType(null);
    }
  }, [
    mineGame.isConfirmed,
    mineGame.receipt,
    mineGame.hash,
    mineGame.pendingTxType,
    mineGameActions,
  ]);
  // Helper functions
  const getStartButtonText = () => {
    if (!mineGame.isConnected) return "Connect Wallet to Play";
    if (mineGame.isWritePending) return "Waiting for wallet...";
    if (mineGame.loading) return "Starting...";
    return `Start Game (${mineGame.gameFee} SOMI)`;
  };

  const handleStartNewGame = () => {
    mineGame.resetGame();
    mineGame.setShowExplosionDialog(false);
    setShowMines(false);
  };

  const handleSeeMines = () => {
    if (mineGame.backendGame?.minePositions) {
      console.log(
        "See Mines clicked. Mine positions:",
        mineGame.backendGame.minePositions,
      );

      // Simply add all mine positions to revealed tiles
      const newRevealedTiles = new Set([
        ...mineGame.revealedTiles,
        ...mineGame.backendGame.minePositions,
      ]);

      console.log("Setting revealed tiles to:", Array.from(newRevealedTiles));
      mineGame.setRevealedTiles(newRevealedTiles);
      setShowMines(true);
    }
    mineGame.setShowExplosionDialog(false);
  };

  const handleCloseXPDialog = () => {
    mineGame.setShowXPDialog(false);
    mineGame.setXpData(null);
  };

  const isGameDisabled =
    !mineGame.isConnected || mineGame.loading || mineGame.isWritePending;

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full lg:h-screen lg:overflow-hidden p-4">
      <div className="max-w-7xl mx-auto flex flex-col items-center lg:h-full">
        {/* Back Button */}
        <div className="flex flex-col lg:flex-row gap-6 w-full justify-center">
          <div className="flex-1 lg:max-w-2xl">
            <div className="mb-6">
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
          </div>
          <div className="lg:w-80 xl:w-96"></div>
        </div>

        <ConnectionStatus
          isConnected={mineGame.isConnected}
          isClient={isClient}
        />

        {/* Dialogs */}
        <ConfirmationDialog
          open={mineGame.showConfirmation}
          onOpenChange={mineGame.setShowConfirmation}
          mineCount={mineGame.mineCount}
          gameFee={mineGame.gameFee}
          onConfirm={mineGameActions.startGame}
          isGameDisabled={isGameDisabled}
          getStartButtonText={getStartButtonText}
        />

        <ExplosionDialog
          open={mineGame.showExplosionDialog}
          onOpenChange={mineGame.setShowExplosionDialog}
          backendGame={mineGame.backendGame}
          onStartNewGame={handleStartNewGame}
          onSeeMines={handleSeeMines}
        />

        <TransactionLoadingDialog
          open={mineGame.showTransactionLoading}
          onOpenChange={mineGame.setShowTransactionLoading}
        />

        <XPDialog
          open={mineGame.showXPDialog}
          onOpenChange={mineGame.setShowXPDialog}
          xpData={mineGame.xpData}
          onClose={handleCloseXPDialog}
        />

        {/* Main Layout */}
        {mineGame.isConnected && (
          <div className="flex flex-col lg:flex-row gap-6 w-full justify-center lg:flex-1 lg:overflow-hidden">
            {/* Game Section - Left side */}
            <div className="flex-1 lg:max-w-2xl lg:overflow-y-auto">
              <div className="backdrop-blur-[60px] bg-translucent-dark-12 border-2 rounded-2xl lg:rounded-3xl border-translucent-light-4 p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Mines</h2>

                <GameControls
                  mineCount={mineGame.mineCount}
                  onMineCountChange={mineGame.setMineCount}
                  backendGame={mineGame.backendGame}
                  isGameDisabled={isGameDisabled}
                  onStartGame={mineGameActions.showGameConfirmation}
                  getStartButtonText={getStartButtonText}
                />

                {mineGame.backendGame && (
                  <GameInfo backendGame={mineGame.backendGame} />
                )}

                <div className="bg-translucent-dark-24 border border-translucent-light-4 rounded-2xl p-6">
                  <GameBoard
                    key={`${showMines ? "mines-shown" : "normal"}-${Array.from(mineGame.revealedTiles).join(",")}`}
                    backendGame={mineGame.backendGame}
                    revealedTiles={mineGame.revealedTiles}
                    mineTiles={mineGame.mineTiles}
                    flippingTiles={mineGame.flippingTiles}
                    onRevealTile={mineGameActions.revealTile}
                  />
                </div>

                {mineGame.backendGame && !showMines && (
                  <CashOutSection
                    backendGame={mineGame.backendGame}
                    loading={mineGame.loading}
                    onCashOut={mineGameActions.cashOut}
                  />
                )}

                {showMines && (
                  <div className="mt-6">
                    <GlareButton
                      onClick={handleStartNewGame}
                      background="rgba(245, 186, 49, 1)"
                      borderRadius="12px"
                      glareColor="#ffffff"
                      borderColor="rgba(224, 164, 41, 1)"
                      className="w-full h-[48px] py-3 px-6 flex items-center justify-center gap-2"
                    >
                      <span className="text-dark-primary font-semibold text-button-48">
                        Start New Game
                      </span>
                    </GlareButton>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Stats and History - Right side */}
            <div className="lg:w-80 xl:w-96 space-y-6 lg:overflow-y-auto">
              <StatsSection
                userStats={mineGame.userStats}
                totalXP={userStatsQuery.data?.xp}
              />

              <GameHistorySection gameHistory={mineGame.gameHistory} />
            </div>
          </div>
        )}

        <StatusMessage message={mineGame.message} />
      </div>
    </div>
  );
}
