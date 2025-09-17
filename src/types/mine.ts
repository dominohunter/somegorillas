export interface Game {
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

export interface RevealResponse {
  success: boolean;
  isMine: boolean;
  tileIndex: number;
  gameComplete: boolean;
  gameState: string;
  tilesRevealed: number;
  revealedTiles: number[];
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesPerfect: number;
  totalTilesRevealed: number;
  totalMinesHit: number;
  currentWinStreak: number;
  bestWinStreak: number;
  highestTilesInGame: number;
}

export interface GameHistory {
  games: Game[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface XPCalculation {
  success: boolean;
  gameId: string;
  gameState: string;
  tilesRevealed: number;
  mineCount: number;
  xpEarned: number;
  bonuses: {
    isFirstGame: boolean;
    isFirstGameToday: boolean;
    baseXp: number;
    difficultyMultiplier: number;
    perfectGameBonus: number;
    firstGameBonus: number;
    dailyFirstBonus: number;
  };
  alreadyCalculated?: boolean;
}

export type TransactionType = "startGame" | "cashOut" | null;

export interface PendingTransaction {
  id: string;
  transactionHash: string;
  blockNumber: number;
  eventIndex: number;
  player: string;
  processed: boolean;
  instanceId: string;
  claimedAt: string;
  processedAt?: string;
  createdAt: string;
}

export interface PendingTransactionsResponse {
  transactions: PendingTransaction[];
  total: number;
  processed: number;
  pending: number;
}