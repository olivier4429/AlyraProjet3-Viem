import { mainnet, sepolia, hardhat } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';

// Déterminer les chains selon l'environnement
const isProduction = import.meta.env.VITE_APP_ENV === 'vercel';


// Chains conditionnelles
const chains = isProduction
  ? [sepolia] as const // ✅ Vercel : SEULEMENT Sepolia
  : [hardhat, sepolia, mainnet] as const; // 🛠️ Dev : tous les réseaux



export const config = getDefaultConfig({
  appName: 'Projet3 app',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  chains: chains,
  //  Configuration des RPC personnalisés
  transports: {
    [hardhat.id]: http('http://127.0.0.1:8545'),
    [sepolia.id]: import.meta.env.VITE_SEPOLIA_RPC_URL
      ? http(import.meta.env.VITE_SEPOLIA_RPC_URL)
      : http(),
    [mainnet.id]: http(), 
  },
});



