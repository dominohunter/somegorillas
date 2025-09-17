import api from "./axios";
import { PendingTransactionsResponse } from "@/types/mine";

/**
 * API functions for pending transactions
 */
export const pendingTransactionsApi = {
  /**
   * Create a new pending transaction record
   * @param transactionHash - The blockchain transaction hash
   * @param gameType - Type of game ("coinflip" | "minegame")
   * @returns Promise<any>
   */
  createPendingTransaction: async (transactionHash: string, gameType: "coinflip" | "minegame"): Promise<unknown> => {
    const response = await api.post("/pending-transactions", {
      transactionHash,
      gameType
    });
    return response.data;
  },

  /**
   * Fetch all pending transactions
   * @returns Promise<PendingTransactionsResponse>
   */
  getPendingTransactions: async (): Promise<PendingTransactionsResponse> => {
    const response = await api.get("/pending-transactions");
    return response.data;
  },
};