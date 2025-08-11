import { REQUIRED_CHAIN_ID } from "@/lib/config";
import { useEffect } from "react";
import { useAccount, useDisconnect, useSwitchChain } from "wagmi";

export const useChainValidation = () => {
  const { chain, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    if (isConnected && chain && chain.id !== REQUIRED_CHAIN_ID) {
      // console.log(
      //   `Wrong chain detected: ${chain.id}, required: ${REQUIRED_CHAIN_ID}`,
      // );
    }
  }, [chain, isConnected, disconnect]);

  const isOnCorrectChain = chain?.id === REQUIRED_CHAIN_ID;

  return {
    isOnCorrectChain,
    currentChainId: chain?.id,
    requiredChainId: REQUIRED_CHAIN_ID,
    switchToCorrectChain: () => switchChain({ chainId: REQUIRED_CHAIN_ID }),
  };
};
