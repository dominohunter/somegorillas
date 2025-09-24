import { REQUIRED_CHAIN_ID } from "@/lib/config";
import { useEffect } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { toast } from "sonner";
import { somniaMainnet } from "@/app/provider";

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

export const useChainValidation = () => {
  const { chain, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();

  const addSomniaNetwork = async () => {
    try {
      const ethereum = (window as Window & { ethereum?: EthereumProvider }).ethereum;
      if (ethereum) {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${REQUIRED_CHAIN_ID.toString(16)}`,
            chainName: somniaMainnet.name,
            nativeCurrency: somniaMainnet.nativeCurrency,
            rpcUrls: [somniaMainnet.rpcUrls.default.http[0]],
            blockExplorerUrls: [somniaMainnet.blockExplorers.default.url],
          }],
        });
      }
    } catch (error) {
      console.error('Failed to add network:', error);
      toast.error("Failed to add Somnia network. Please add it manually.");
    }
  };

  useEffect(() => {
    if (isConnected && chain && chain.id !== REQUIRED_CHAIN_ID) {
      // Ask user to add/switch to correct network
      toast.error("Please switch to Somnia network", {
        action: {
          label: "Add Network",
          onClick: addSomniaNetwork
        },
        duration: 10000
      });
    }
  }, [chain, isConnected]);

  const isOnCorrectChain = chain?.id === REQUIRED_CHAIN_ID;

  return {
    isOnCorrectChain,
    currentChainId: chain?.id,
    requiredChainId: REQUIRED_CHAIN_ID,
    switchToCorrectChain: () => switchChain({ chainId: REQUIRED_CHAIN_ID }),
  };
};
