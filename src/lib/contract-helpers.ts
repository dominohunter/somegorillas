import { ethers } from "ethers";

async function getEthersObjects() {
	const nftAbi = [
		"function totalSupply() view returns (uint256)",
		"function balanceOf(address owner) view returns (uint256)",
		"function ownerOf(uint256 tokenId) view returns (address)",
		{
			inputs: [
				{ internalType: "address", name: "to", type: "address" },
				{ internalType: "uint256", name: "tokenId", type: "uint256" },
			],
			name: "approve",
			outputs: [],
			stateMutability: "nonpayable",
			type: "function",
		},
	];

	const stakingAbi = [
		{ inputs: [{ internalType: "uint256", name: "nftId", type: "uint256" }], name: "stake", outputs: [], stateMutability: "nonpayable", type: "function" },
		"function getUserStakes(address _user) view returns (uint256[] memory)",
		{
			inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
			name: "stakes",
			outputs: [
				{ internalType: "address", name: "owner", type: "address" },
				{ internalType: "uint64", name: "start", type: "uint64" },
				{ internalType: "uint64", name: "unlock", type: "uint64" },
				{ internalType: "uint128", name: "bananaClaimed", type: "uint128" },
			],
			stateMutability: "view",
			type: "function",
		},
		{
			inputs: [{ internalType: "uint256", name: "nftId", type: "uint256" }],
			name: "bananaPending",
			outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
			stateMutability: "view",
			type: "function",
		},
	];

	const provider = new ethers.BrowserProvider(window.ethereum);
	// const provider = new ethers.JsonRpcProvider("https://api.infra.mainnet.somnia.network")

	const signer = await provider.getSigner();
	const nftContract = new ethers.Contract("0x8769ce9d2e1997061e629e9ca0b18b648db5e3a6", nftAbi, signer);
	const stakingContract = new ethers.Contract("0x8310e2F3C08c13a942F21a5c3bc6e6cE7dE5a4fD", stakingAbi, signer);

	return { provider, signer, nftContract, stakingContract };
}

export { getEthersObjects };
