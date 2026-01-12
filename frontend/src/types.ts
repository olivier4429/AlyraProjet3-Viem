
export interface Voter {
  isRegistered: boolean;
  hasVoted: boolean;
  votedProposalId: bigint;
}

export interface Proposal {
    description: string;
    voteCount: bigint;
}