# ⚛️ Voting DApp - Frontend

Interface React moderne pour interagir avec le smart contract de vote.

## 🛠️ Stack technique

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool ultra-rapide
- **Wagmi v2** - React Hooks pour Ethereum
- **RainbowKit** - Connexion wallet
- **Viem** - Ethereum TypeScript library
- **TailwindCSS** - Styling utility-first
- **shadcn/ui** - Composants UI réutilisables
- **React Query** - Gestion du cache et des requêtes

## 🚀 Quick Start

```bash
# Installation
npm install

# Configuration
cp .env.example .env.local
# Éditer .env.local avec vos valeurs

# Développement
npm run dev

# Build
npm run build

# Preview du build
npm run preview
```

## ⚙️ Configuration

### Variables d'environnement

```bash
# .env.local
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
VITE_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
VITE_APP_ENV=development
```

**Important** : Toutes les variables doivent commencer par `VITE_` pour être accessibles.

### Configuration Wagmi

```typescript
// src/wagmi.ts
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia, hardhat } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Voting DApp',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  chains: [
    hardhat,    // Développement local
    sepolia,    // Testnet
    mainnet     // Production
  ],
});
```

### Configuration des constantes

```typescript
// src/constants.ts
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`;

export const WORKFLOW_STATUS = {
  RegisteringVoters: 0,
  ProposalsRegistrationStarted: 1,
  ProposalsRegistrationEnded: 2,
  VotingSessionStarted: 3,
  VotingSessionEnded: 4,
  VotesTallied: 5,
} as const;
```

## 🏗️ Architecture

### Structure des dossiers

```
src/
├── abi/
│   └── voting.ts              # ABI du smart contract
├── components/
│   ├── admin/
│   │   ├── AddVoter.tsx       # Enregistrement des votants
│   │   └── WorkflowManager.tsx # Gestion des phases
│   ├── voting/
│   │   ├── AddProposal.tsx    # Soumission de propositions
│   │   ├── ProposalsList.tsx  # Liste et vote
│   │   └── VoteResults.tsx    # Résultats du vote
│   ├── layout/
│   │   ├── Header.tsx         # En-tête avec ConnectButton
│   │   └── Footer.tsx         # Pied de page
│   ├── shared/
│   │   └── CustomMessageCard.tsx # Messages réutilisables
│   └── ui/                    # Composants shadcn/ui
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── ...
├── contexts/
│   └── AppContext.tsx         # Context global de l'app
├── hooks/
│   └── useOwner.ts            # Hook custom pour vérifier le propriétaire
│   └── useVoter.ts            # Hook pour avoir des sur le voter connecté
│   └── useworkflow.ts         # Hook pour connaitre l'état du workflow
├── types.ts                   # Types Voter et Proposal utilisé dans l'app
├── constants.ts               # Constantes (adresse, enum, etc.)
├── providers.tsx              # Providers Wagmi, RainbowKit, Query
├── wagmi.ts                   # Configuration Wagmi
├── global.css                 # Styles globaux
├── App.tsx                    # Composant racine
└── main.tsx                   # Point d'entrée
```

## 🧪 Tests

```bash
# Tests unitaires (à venir)
npm run test

# Tests avec UI
npm run test:ui

# Couverture de code
npm run test:coverage
```

## 📦 Build et déploiement

```bash
# Build de production
npm run build

# Analyser le bundle
npm run build -- --mode analyze

# Déployer sur Vercel
vercel
```


## 🔗 Ressources

- [Wagmi Documentation](https://wagmi.sh/)
- [RainbowKit Docs](https://www.rainbowkit.com/)
- [Viem Documentation](https://viem.sh/)
- [shadcn/ui](https://ui.shadcn.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Vite Guide](https://vitejs.dev/guide/)

## 📝 Licence

MIT