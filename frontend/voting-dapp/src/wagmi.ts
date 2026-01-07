import { mainnet, sepolia, hardhat } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit';


export const config = getDefaultConfig({
  appName: 'Projet3 app',
  projectId: '2ce3111a7d9bc47a716178ccde6ea8ff',
  chains: [hardhat,mainnet, sepolia],
});



