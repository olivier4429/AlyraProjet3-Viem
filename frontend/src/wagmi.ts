import { mainnet, sepolia, hardhat } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

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
    // RPC pour Sepolia
    [sepolia.id]: import.meta.env.VITE_SEPOLIA_RPC_URL 
      ? http(import.meta.env.VITE_SEPOLIA_RPC_URL) // 👈  RPC personnalisé
      : http(), // 👈 RPC public par défaut si pas de variable
  },
});



