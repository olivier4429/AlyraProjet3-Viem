import { mainnet, sepolia, hardhat } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

// Déterminer les chains selon l'environnement
const isProduction = import.meta.env.VITE_APP_ENV === 'vercel';


// Chains conditionnelles
const chains = isProduction 
  ? [sepolia] // ✅ Vercel : SEULEMENT Sepolia
  : [hardhat, sepolia, mainnet]; // 🛠️ Dev : tous les réseaux



export const config = getDefaultConfig({
  appName: 'Projet3 app',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  chains: chains,
});



