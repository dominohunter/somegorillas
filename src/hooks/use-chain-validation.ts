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
        // Try to switch first, if that fails then add the network
        try {
          await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${REQUIRED_CHAIN_ID.toString(16)}` }],
          });
        } catch (switchError: unknown) {
          // If switching fails (network doesn't exist), add it
          const errorWithCode = switchError as { code?: number };
          if (errorWithCode.code === 4902) {
            await ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: `0x${REQUIRED_CHAIN_ID.toString(16)}`,
                chainName: somniaMainnet.name,
                nativeCurrency: {
                  name: "Somnia", 
                  symbol: "SOMI", 
                  decimals: 18
                },
                rpcUrls: [somniaMainnet.rpcUrls.default.http[0]],
                blockExplorerUrls: [somniaMainnet.blockExplorers.default.url],
                iconUrls: ["https://somnia.network/favicon.ico"]
              }],
            });
            
            // After adding, try to switch to it
            await ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: `0x${REQUIRED_CHAIN_ID.toString(16)}` }],
            });
          } else {
            throw switchError;
          }
        }
      }
    } catch (error) {
      console.error('Failed to add network:', error);
      toast.error("Failed to add Somnia network. Please add it manually.");
    }
  };

  useEffect(() => {
    if (isConnected && chain && chain.id !== REQUIRED_CHAIN_ID) {
      // Show notification only, no auto-switching
      toast.error("Please switch to Somnia network to play games", {
        action: {
          label: "Add Network",
          onClick: addSomniaNetwork
        },
        duration: 10000,
        id: 'wrong-network' // Prevent duplicate toasts
      });
    }
  }, [chain, isConnected]);

  const isOnCorrectChain = chain?.id === REQUIRED_CHAIN_ID;

  const manualSwitchToSomnia = () => {
    switchChain({ chainId: REQUIRED_CHAIN_ID }, {
      onError: () => {
        // If switch fails, try adding the network
        addSomniaNetwork();
      }
    });
  };

  return {
    isOnCorrectChain,
    currentChainId: chain?.id,
    requiredChainId: REQUIRED_CHAIN_ID,
    switchToCorrectChain: manualSwitchToSomnia,
  };
};
