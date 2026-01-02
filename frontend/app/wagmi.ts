import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, hardhat } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
/*export const config2 = createConfig({
    chains: [mainnet, sepolia, hardhat],
    transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http(),
        [hardhat.id]: http(),
    },
    ssr: true, // If your dApp uses server side rendering (SSR)
})*/

export const config = getDefaultConfig({
  appName: 'Projet3 app',
  projectId: 'Projet3',
  chains: [mainnet, sepolia, hardhat],
  ssr: true, // If your dApp uses server side rendering (SSR)
});



