// app/providers.tsx
"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { metaMask } from "wagmi/connectors";

import { defineChain } from "viem";

export const somniaMainnet = defineChain({
  id: 5031,
  name: "Somnia Mainnet",
  nativeCurrency: { name: "SOMI", symbol: "SOMI", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://api.infra.mainnet.somnia.network"] },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://explorer.somnia.network/",
    },
  },
});

const config = createConfig({
  chains: [somniaMainnet],
  connectors: [metaMask()],
  transports: {
    [somniaMainnet.id]: http(),
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
