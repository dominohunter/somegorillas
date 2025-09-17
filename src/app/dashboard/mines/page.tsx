"use client";

import React, { useState, useEffect } from "react";
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
  const [isClient, setIsClient] = useState(false);
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
          await pendingTransactionsApi.createPendingTransaction(mineGame.hash!, "minegame");
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
    return `Start Game (${mineGame.gameFee} STT)`;
  };

  const handleStartNewGame = () => {
    mineGame.resetGame();
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
    <div className="w-full min-h-screen p-4">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
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
          <div className="flex flex-col lg:flex-row gap-6 mt-6 w-full justify-center">
            {/* Game Section - Left side */}
            <div className="flex-1 lg:max-w-2xl">
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
                    backendGame={mineGame.backendGame}
                    revealedTiles={mineGame.revealedTiles}
                    mineTiles={mineGame.mineTiles}
                    flippingTiles={mineGame.flippingTiles}
                    onRevealTile={mineGameActions.revealTile}
                  />
                </div>

                {mineGame.backendGame && (
                  <CashOutSection
                    backendGame={mineGame.backendGame}
                    loading={mineGame.loading}
                    onCashOut={mineGameActions.cashOut}
                  />
                )}
              </div>
            </div>

            {/* Sidebar - Stats and History - Right side */}
            <div className="lg:w-80 xl:w-96 space-y-6">
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
