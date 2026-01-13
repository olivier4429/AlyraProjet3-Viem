import { mainnet, sepolia, hardhat } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit';


export const config = getDefaultConfig({
  appName: 'Projet3 app',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  chains: [hardhat,mainnet, sepolia],
});



