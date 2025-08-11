// ========================================
// TYPE DEFINITIONS
// ========================================

/**
 * Represents the result of a coin flip
 */
export interface FlipResult {
  result: string;
  prediction: string;
  isWin: boolean;
}

/**
 * Main state interface for the coin flip component
 */
export interface FlipState {
  prediction: "heads" | "tails" | null;
  isFlipping: boolean;
  showResultModal: boolean;
  lastFlipResult: FlipResult | null;
  transactionPredictions: Record<string, string>;
  processedTxHash: string | null;
  toastShownForTx: string | null;
}

/**
 * API response interface for user stats
 */
export interface UserStats {
  totalFlips: number;
  wins: number;
  losses: number;
  winRate: number;
  totalWinnings: string;
  totalLosses: string;
}

/**
 * API response interface for flip history
 */
export interface FlipHistoryItem {
  id: string;
  result: string;
  prediction: string;
  isWin: boolean;
  timestamp: string;
  transactionHash: string;
}

/**
 * Decoded event structure from the smart contract
 */
export interface CoinFlippedEvent {
  player: string;
  guess: boolean;
  isHeads: boolean;
  blockNumber: bigint;
}

/**
 * Action types for the state reducer
 */
export type FlipAction =
  | { type: "SET_PREDICTION"; payload: "heads" | "tails" | null }
  | { type: "START_FLIP"; payload: { hash: string; prediction: string } }
  | { type: "SET_FLIPPING"; payload: boolean }
  | { type: "SET_RESULT"; payload: { result: FlipResult; txHash: string } }
  | { type: "SHOW_MODAL"; payload: boolean }
  | { type: "MARK_TX_PROCESSED"; payload: string }
  | { type: "MARK_TOAST_SHOWN"; payload: string }
  | { type: "CLEANUP_TX"; payload: string }
  | { type: "RESET_STATE" };

export interface Quest {
  id: string;
  userId: string;
  questId: string;
  completed: boolean;
  progressCount: number;
  updatedAt: string;
  claimed?: boolean; // Add this field to track if reward was claimed
  quest: {
    id: string;
    type: string;
    condition: string;
    active: boolean;
    rewardXp: number;
    createdAt: string;
  };
}

export interface SystemStatus {
  isHealthy: boolean;
  listener: {
    isHealthy: boolean;
    lastChecked: string | null;
    reconnectAttempts: number;
    consecutiveFailures: number;
  };
  polling: {
    isActive: boolean;
    currentLeader: string | null;
    lastProcessedBlock: number;
    lastHeartbeat: string | null;
  };
  activity: {
    hasRecentActivity: boolean;
    lastFlip: string | null;
  };
  checkedAt: string;
}

export interface UserStats {
  id: string;
  walletAddress: string;
  xp: number;
  totalFlips: number;
  totalHeads: number;
  totalTails: number;
  winRate: number; // Calculated field
  referralCode: string;
  referredBy: string | null;
}

export interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  xpReward: number;
  achievedAt?: string; // From AchievementOnUser
  claimed: boolean; // If tracking claimed status
  progress: number;
  goal: number;
}
export interface Quest {
  id: string;
  questId: string;
  title: string;
  description: string;
  reward: number;
  completed: boolean;
  completedAt?: string;
  rewardXp: number;
  condition: string;
  requirements: {
    type: string;
    target: number;
    current: number;
  };
  // Add other quest properties as needed
}

export interface UserQuest {
  id: string;
  questId: string;

  completed: boolean;
  completedAt?: string;
  progressCount: number;
  claimed: boolean;
  quest: Quest;
  // Add other quest properties as needed
}

export interface Referral {
  id: string;
  code: string;
  referredUsers: string[];
  totalRewards: number;
  referralCode: string;
  // Add other referral properties as needed
}

export interface FlipHistory {
  id: string;
  userAddress: string;
  amount: number;
  result: string;
  createdAt: string;
  isWin: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  address: string;
  totalFlips: number;
  wins: number;
  winRate: number;
  totalEarnings: number;
  walletAddress: string;
  xp: number;
  // Add other leaderboard properties as needed
}
export interface GlobalStats {
  walletAddress: string;
  xp: number;
  totalFlips: number;
  totalHeads: number;
  totalTails: number;
  rank: number;
  totalXpGiven: number;
  totalUsers: number;
}

export interface UserRemainingFlip {
  count: number;
  remaining: number;
  maxFlip: number;
}
