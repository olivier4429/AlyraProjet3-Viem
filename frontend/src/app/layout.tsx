'use client'
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider, http } from 'wagmi';
import {  sepolia, hardhat } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const config = getDefaultConfig({
  appName: 'My Voting DApp',
  projectId: 'VOTRE_PROJECT_ID', // À obtenir sur cloud.walletconnect.com
  chains: [hardhat,sepolia],
  // L'ajout des transports explicitement règle souvent le problème de type missing property
  transports: {
    [hardhat.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: true,
});

const queryClient = new QueryClient();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider>
              {children}
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}