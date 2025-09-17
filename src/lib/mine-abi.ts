export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
// export const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_URL ||
//   "https://gorillaz-backend-43c2e114d9b4.herokuapp.com/api";

export const COINFLIP_ADDRESS = "0x6D95d0879da470305Af2418E8d34C6D12d23C7ea";
export const REQUIRED_CHAIN_ID = 50312;

export const COINFLIP_FEE = "0.0001";
export const COINFLIP_ABI = [
  {
    name: "flipCoin",
    type: "function",
    stateMutability: "payable",
    inputs: [
      {
        name: "guess",
        type: "bool",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
  },
  {
    type: "event",
    name: "CoinFlipped",
    inputs: [
      {
        name: "player",
        type: "address",
        indexed: true,
      },
      {
        name: "guess",
        type: "bool",
        indexed: false,
      },
      {
        name: "isHeads",
        type: "bool",
        indexed: false,
      },
      {
        name: "blockNumber",
        type: "uint256",
        indexed: false,
      },
    ],
    anonymous: false,
  },
];

export const MINEGAME_ABI = [
  {
    type: "function",
    name: "startGame",
    inputs: [
      {
        name: "_mineCount",
        type: "uint8",
      },
    ],
    outputs: [
      {
        name: "gameId",
        type: "uint256",
      },
    ],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "requestCashOut",
    inputs: [
      {
        name: "_gameId",
        type: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getGame",
    inputs: [
      {
        name: "_gameId",
        type: "uint256",
      },
    ],
    outputs: [
      {
        name: "player",
        type: "address",
      },
      {
        name: "mineCount",
        type: "uint8",
      },
      {
        name: "tilesRevealed",
        type: "uint8",
      },
      {
        name: "state",
        type: "uint8",
      },
      {
        name: "startTime",
        type: "uint64",
      },
      {
        name: "betAmount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "gameFee",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "settleGame",
    inputs: [
      {
        name: "gameId",
        type: "uint256",
      },
      {
        name: "finalState",
        type: "uint8",
      },
      {
        name: "tilesRevealed",
        type: "uint8",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "GameStarted",
    inputs: [
      {
        name: "gameId",
        type: "uint256",
        indexed: true,
      },
      {
        name: "player",
        type: "address",
        indexed: true,
      },
      {
        name: "mineCount",
        type: "uint8",
        indexed: false,
      },
      {
        name: "betAmount",
        type: "uint256",
        indexed: false,
      },
    ],
  },
  {
    type: "event",
    name: "GameSettled",
    inputs: [
      {
        name: "gameId",
        type: "uint256",
        indexed: true,
      },
      {
        name: "player",
        type: "address",
        indexed: true,
      },
      {
        name: "finalState",
        type: "uint8",
        indexed: false,
      },
      {
        name: "tilesRevealed",
        type: "uint8",
        indexed: false,
      },
    ],
  },
] as const;
