"use client";

import { useAccount, useSwitchChain, useChainId } from "wagmi";
import { GlareButton } from "@/components/ui/glare-button";
import { somniaMainnet } from "@/app/provider";

export function ChainSwitcher() {
  const { isConnected } = useAccount();
  const { switchChain, isPending } = useSwitchChain();
  const chainId = useChainId();

  const isOnCorrectChain = chainId === somniaMainnet.id;

  const handleSwitchChain = () => {
    if (isConnected && switchChain) {
      switchChain({ chainId: somniaMainnet.id });
    }
  };

  if (!isConnected || isOnCorrectChain) {
    return null;
  }

  return (
    <GlareButton
      onClick={handleSwitchChain}
      disabled={isPending}
      background="rgba(255, 107, 107, 0.1)"
      borderRadius="12px"
      glareColor="#ffffff"
      borderColor="rgba(255, 107, 107, 0.2)"
      className="backdrop-blur-[40px] w-auto h-[40px] sm:h-[44px] md:h-[56px] py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 flex items-center gap-1 sm:gap-2 disabled:opacity-50"
    >
      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500" />
      
      <p className="text-light-primary font-pally text-[12px] sm:text-[14px] md:text-[16px]">
        Switch to Somnia
      </p>

      {isPending && (
        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      )}
    </GlareButton>
  );
}