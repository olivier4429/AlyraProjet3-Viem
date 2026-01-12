# 🗳️ Système de Vote Décentralisé

Application de vote décentralisée (DApp) permettant un processus de vote transparent et sécurisé sur la blockchain Ethereum.

## 📋 Vue d'ensemble

- **Backend** : Smart contract Solidity avec gestion complète du workflow de vote
- **Frontend** : Interface React moderne avec Vite, Wagmi et RainbowKit
- **Blockchain** : Compatible Ethereum, testnets et réseaux locaux (Hardhat)

---

## 🔗 Backend - Smart Contract (Solidity)


### Fonctions principales

#### Pour l'administrateur (Owner)
```solidity
function addVoter(address _addr) external onlyOwner;
function startProposalsRegistering() external onlyOwner;
function endProposalsRegistering() external onlyOwner;
function startVotingSession() external onlyOwner;
function endVotingSession() external onlyOwner;
function tallyVotes() external onlyOwner;
```

#### Pour les votants
```solidity
function addProposal(string calldata _desc) external;
function setVote(uint128 _id) external;
function getOneProposal(uint128 _id) external view returns (Proposal memory);
function getVoter(address _addr) external view returns (Voter memory);
```

### Événements
```solidity
event VoterRegistered(address voterAddress);
event ProposalRegistered(uint256 proposalId);
event Voted(address voter, uint128 proposalId);
event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
```

### Déploiement du contrat

```bash
# 1. Installer les dépendances
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# 2. Compiler
npx hardhat compile

# 3. Déployer en local
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost

# 4. Déployer sur Sepolia
npx hardhat run scripts/deploy.js --network sepolia
```

---

## ⚛️ Frontend - React + Vite + Wagmi + RainbowKit

### Stack technologique

- **React 18** - UI Framework
- **TypeScript** - Typage statique
- **Vite** - Build tool ultra-rapide
- **Wagmi v2** - Hooks React pour Ethereum
- **RainbowKit** - Connexion wallet (MetaMask, WalletConnect, etc.)
- **Viem** - Librairie Ethereum TypeScript
- **TailwindCSS** - Styling
- **shadcn/ui** - Composants UI

### Installation

```bash

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos valeurs

# Lancer en développement
npm run dev
```





### Composants principaux

#### Connexion wallet
```typescript
import { ConnectButton } from '@rainbow-me/rainbowkit';

function Header() {
  return <ConnectButton />;
}
```

#### Lecture du contrat
```typescript
import { useReadContract } from 'wagmi';

function ProposalsList() {
  const { data: proposal } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getOneProposal',
    args: [BigInt(proposalId)],
  });
}
```

#### Écriture sur le contrat
```typescript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

function Vote() {
  const { writeContract, data: hash } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });
  
  const handleVote = (proposalId: number) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'setVote',
      args: [BigInt(proposalId)],
    });
  };
}
```

#### Écoute d'événements
```typescript
import { useWatchContractEvent } from 'wagmi';

function ProposalsList() {
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    eventName: 'ProposalRegistered',
    onLogs(logs) {
      // Mise à jour en temps réel
    },
  });
}
```



## 🚀 Déploiement

### Variables d'environnement

```bash
# .env.local
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
VITE_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
VITE_APP_ENV=production
```

⚠️ **Important** : Avec Vite, toutes les variables doivent commencer par `VITE_`

### Build

```bash
npm run build
```

### Déploiement sur Vercel

```bash
# Via CLI
vercel

# Ou connecter votre repo GitHub sur vercel.com
# Ajouter les variables d'environnement dans Settings > Environment Variables
```

---

## 🎯 Workflow de vote

```
Phase 0: Enregistrement des votants (admin)
    ↓
Phase 1: Soumission des propositions (votants)
    ↓
Phase 2: Fin de l'enregistrement
    ↓
Phase 3: Session de vote (votants)
    ↓
Phase 4: Vote terminé
    ↓
Phase 5: Décompte et résultats
```

---

## 🔧 Scripts disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run preview      # Prévisualiser le build
npm run lint         # Linter le code
npm run lint:fix     # Corriger automatiquement
npm run format       # Formatter avec Prettier
npm run type-check   # Vérifier les types TypeScript
```

---

## 📚 Ressources

### Backend (Solidity)
- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Solidity Documentation](https://docs.soliditylang.org/)

### Frontend (React + Wagmi)
- [Wagmi Documentation](https://wagmi.sh/)
- [RainbowKit Documentation](https://www.rainbowkit.com/)
- [Viem Documentation](https://viem.sh/)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)

---

## 📝 Licence

MIT © Olivier 

