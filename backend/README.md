# 🔐 Voting Smart Contract - Backend

Smart contract Solidity pour un système de vote décentralisé sécurisé.

## 📋 Contrat Principal

```solidity
contract Voting is Ownable {
    uint128 public constant MAX_PROPOSALS = 100;
    uint128 public winningProposalID;
    WorkflowStatus public workflowStatus;
    
    mapping(address => Voter) voters;
    Proposal[] proposalsArray;
}
```

## 🏗️ Structures de données

### Voter
```solidity
struct Voter {
    bool isRegistered;      // Est-ce que l'adresse est autorisée à voter
    bool hasVoted;          // A-t-elle déjà voté
    uint128 votedProposalId; // ID de la proposition pour laquelle elle a voté
}
```

### Proposal
```solidity
struct Proposal {
    string description;     // Description de la proposition
    uint256 voteCount;      // Nombre de votes reçus
}
```

### WorkflowStatus
```solidity
enum WorkflowStatus {
    RegisteringVoters,           // 0 - Enregistrement des votants
    ProposalsRegistrationStarted, // 1 - Soumission des propositions
    ProposalsRegistrationEnded,   // 2 - Fin des propositions
    VotingSessionStarted,         // 3 - Vote en cours
    VotingSessionEnded,           // 4 - Vote terminé
    VotesTallied                  // 5 - Résultats comptabilisés
}
```

## 📝 Fonctions

### Fonctions Owner uniquement

```solidity
// Ajouter un votant à la whitelist
function addVoter(address _addr) external onlyOwner;

// Démarrer l'enregistrement des propositions
function startProposalsRegistering() external onlyOwner;

// Terminer l'enregistrement des propositions
function endProposalsRegistering() external onlyOwner;

// Démarrer la session de vote
function startVotingSession() external onlyOwner;

// Terminer la session de vote
function endVotingSession() external onlyOwner;

// Comptabiliser les votes et déterminer le gagnant
function tallyVotes() external onlyOwner;
```

### Fonctions pour les votants

```solidity
// Soumettre une proposition (phase 1)
function addProposal(string calldata _desc) external;

// Voter pour une proposition (phase 3)
function setVote(uint128 _id) external;
```

### Fonctions de lecture (view)

```solidity
// Récupérer les informations d'un votant
function getVoter(address _addr) external view returns (Voter memory);

// Récupérer les détails d'une proposition
function getOneProposal(uint128 _id) external view returns (Proposal memory);

// Récupérer l'owner du contrat
function owner() external view returns (address);

// Récupérer le statut du workflow
function workflowStatus() external view returns (WorkflowStatus);

// Récupérer l'ID de la proposition gagnante
function winningProposalID() external view returns (uint128);
```

## 🔔 Événements

```solidity
// Émis quand un votant est enregistré
event VoterRegistered(address voterAddress);

// Émis quand une proposition est enregistrée
event ProposalRegistered(uint256 proposalId);

// Émis quand quelqu'un vote
event Voted(address voter, uint128 proposalId);

// Émis à chaque changement de phase
event WorkflowStatusChange(
    WorkflowStatus previousStatus, 
    WorkflowStatus newStatus
);
```

## 🛡️ Sécurité et restrictions

### Modificateurs personnalisés

- `onlyVoters` : Seuls les votants enregistrés peuvent appeler
- `onlyOwner` : Seul le propriétaire peut appeler (hérité d'OpenZeppelin)

### Validations

```solidity
// Vérifier que le votant est enregistré
require(voters[msg.sender].isRegistered, "You're not a voter");

// Vérifier que le votant n'a pas déjà voté
require(!voters[msg.sender].hasVoted, "You have already voted");

// Vérifier la phase du workflow
require(workflowStatus == WorkflowStatus.VotingSessionStarted, "Voting session not active");

// Vérifier que la proposition existe
require(_id < proposalsArray.length, "Proposal not found");
```

## 🚀 Installation et déploiement

### Installation

```bash
npm install 
```

### Configuration

```javascript
// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155111
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};
```

### Script de déploiement

```javascript
 scripts/deploy.js
```

### Déploiement

```bash
# Compiler
npx hardhat compile

# Déployer en local
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost

# Déployer sur Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Vérifier sur Etherscan
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

## 🧪 Tests

```javascript
test/Voting.test.js
```

Lancer les tests :
```bash
npx hardhat test
npx hardhat coverage  # Avec couverture de code
```

## 📊 Gas optimization

### Optimisations implémentées

- ✅ Utilisation de `uint128` au lieu de `uint256` quand possible
- ✅ `calldata` au lieu de `memory` pour les paramètres string
- ✅ Packing de variables dans les structs
- ✅ Événements pour réduire les lectures on-chain
- ✅ Proposition GENESIS créée au constructor

### Coûts estimés

| Fonction | Gas estimé |
|----------|------------|
| `addVoter` | ~50,000 |
| `addProposal` | ~60,000 |
| `setVote` | ~60,000 |
| `tallyVotes` | Variable (dépend du nombre de propositions) |

## 🔍 Audit et sécurité

### Points de sécurité

- ✅ Héritage d'OpenZeppelin `Ownable`
- ✅ Pas de fonctions `selfdestruct`
- ✅ Pas de délégation de call
- ✅ Protection contre la réentrance (pas de calls externes)
- ✅ Validations strictes sur toutes les fonctions
- ✅ Événements pour toutes les actions importantes

npm ru

## 📦 ABI Export

```bash
# Générer l'ABI après compilation
npx hardhat compile

# L'ABI se trouve dans :
artifacts/contracts/Voting.sol/Voting.json
```

Pour l'utiliser dans le frontend :
```typescript
// src/abi/voting.ts
export const CONTRACT_ABI = [...] as const;
```

## 🔗 Ressources

- [Hardhat Documentation](https://hardhat.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/)
- [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- [Ethereum Security Best Practices](https://consensys.github.io/smart-contract-best-practices/)

## 📝 Licence

MIT