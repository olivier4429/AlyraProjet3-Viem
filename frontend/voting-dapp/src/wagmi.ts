import { mainnet, sepolia, hardhat } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit';


export const config = getDefaultConfig({
  appName: 'Projet3 app',
  projectId: 'Projet3',
  chains: [hardhat,mainnet, sepolia],
});



