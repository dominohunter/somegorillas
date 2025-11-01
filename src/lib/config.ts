// export const API_BASE_URL = "http://localhost:3001/api";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://gorillaz-backend-43c2e114d9b4.herokuapp.com/api";

export const COINFLIP_ADDRESS = "0x6D95d0879da470305Af2418E8d34C6D12d23C7ea";
export const COINFLIP_BETTING_ADDRESS = "0xc36C0E2497b832b1bf993F5574D702c6a2DEAf97";
export const REQUIRED_CHAIN_ID = 5031;
//heeeloooo
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

// Re-export betting ABI from flip-bet-abi.ts
export { COINFLIP_BETTING_ABI } from "./flip-bet-abi";

// Slot Machine Configuration
export const SLOT_MACHINE_CONTRACT = "0x549bD51F0E53Ad1B7c4A1aECD71000462adcda09";

export const SLOT_MACHINE_ABI = [
	{
		inputs: [
			{ name: "tokenId", type: "uint256" },
			{ name: "rarity", type: "uint8" },
			{ name: "secret", type: "uint256" },
		],
		name: "commit",
		outputs: [],
		stateMutability: "payable",
		type: "function",
	},
	{
		inputs: [{ name: "secret", type: "uint256" }],
		name: "reveal",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [],
		name: "cancelCommitment",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [{ name: "user", type: "address" }],
		name: "getCommitment",
		outputs: [
			{ name: "commitBlock", type: "uint256" },
			{ name: "depositTokenId", type: "uint256" },
			{ name: "depositRarity", type: "uint8" },
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "playFee",
		outputs: [{ name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "getPoolSize",
		outputs: [{ name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "nftCollection",
		outputs: [{ name: "", type: "address" }],
		stateMutability: "view",
		type: "function",
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: true, name: "player", type: "address" },
			{ indexed: false, name: "depositedTokenId", type: "uint256" },
			{ indexed: false, name: "receivedTokenId", type: "uint256" },
			{ indexed: false, name: "receivedRarity", type: "uint8" },
		],
		name: "GameRevealed",
		type: "event",
	},
];

export const NFT_ABI = [
	{
		inputs: [{ name: "owner", type: "address" }],
		name: "balanceOf",
		outputs: [{ name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{ name: "owner", type: "address" },
			{ name: "index", type: "uint256" },
		],
		name: "tokenOfOwnerByIndex",
		outputs: [{ name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [{ name: "tokenId", type: "uint256" }],
		name: "getApproved",
		outputs: [{ name: "", type: "address" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{ name: "to", type: "address" },
			{ name: "tokenId", type: "uint256" },
		],
		name: "approve",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
];
