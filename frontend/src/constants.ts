import { type Address } from "viem";

export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as Address;
//export const CONTRACT_DEPLOYMENT_BLOCK  = import.meta.env.VITE_CONTRACT_DEPLOYMENT_BLOCK;

export const CONTRACT_DEPLOYMENT_BLOCK = (() => {
    const block = import.meta.env.VITE_CONTRACT_DEPLOYMENT_BLOCK;
    try {
        return block ? BigInt(block) : 0n;
    } catch {
        console.warn('Invalid CONTRACT_DEPLOYMENT_BLOCK, using 0');
        return 0n;
    }
})();

export const WORKFLOW_FUNCTIONS = {
  START_PROPOSALS: "startProposalsRegistering",
  END_PROPOSALS: "endProposalsRegistering",
  START_VOTING: "startVotingSession",
  END_VOTING: "endVotingSession",
  TALLY: "tallyVotes",
} as const;

export type WorkflowFunction = typeof WORKFLOW_FUNCTIONS[keyof typeof WORKFLOW_FUNCTIONS];

export const WORKFLOW_STATUS = {
  RegisteringVoters: 0,
  ProposalsRegistrationStarted: 1,
  ProposalsRegistrationEnded: 2,
  VotingSessionStarted: 3,
  VotingSessionEnded: 4,
  VotesTallied: 5,
} as const;

export type WorkflowStatusValue = typeof WORKFLOW_STATUS[keyof typeof WORKFLOW_STATUS];

export const WORKFLOW_LABELS = [
  "Enregistrement des voteurs",
  "Enregistrement des propositions",
  "Enregistrement des propositions terminé",
  "Session de vote",
  "Session de vote terminée",
  "Votes comptabilisés",
] as const;