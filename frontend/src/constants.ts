export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

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