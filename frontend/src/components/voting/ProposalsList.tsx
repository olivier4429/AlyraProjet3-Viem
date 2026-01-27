import { useState, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useProposals, useContractWrite } from '@/hooks';
import { WORKFLOW_STATUS } from '@/constants';
import CustomMessageCard from '@/components/shared/CustomMessageCard';
import { Button } from '@/components/ui/button';
import { Check, Vote } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const TITLE = 'Liste des propositions';

export default function ProposalsList() {
  const { isConnected, isVoter, voterInfo, workflowStatus } = useApp();
  const { proposals, isLoading: isLoadingProposals } = useProposals({
    enabled: isConnected && isVoter,
  });
  const [votingForId, setVotingForId] = useState<number | null>(null);

  const onSuccess = useCallback(() => {
    setVotingForId(null);
  }, []);

  const { write, isLoading: isVoting, isConfirmed, isError, error } = useContractWrite({
    onSuccess,
  });

  const hasVoted = voterInfo?.hasVoted ?? false;
  const votedProposalId = voterInfo?.votedProposalId ? Number(voterInfo.votedProposalId) : null;

  const handleVote = (proposalId: number) => {
    setVotingForId(proposalId);
    write('setVote', [BigInt(proposalId)]);
  };

  // Vérifications d'accès
  if (!isConnected) {
    return (
      <CustomMessageCard title={TITLE}>
        ⚠️ Connectez votre wallet pour voir les propositions.
      </CustomMessageCard>
    );
  }

  if (!isVoter) {
    return (
      <CustomMessageCard title={TITLE}>
        ❌ Vous n'êtes pas enregistré comme votant.
      </CustomMessageCard>
    );
  }

  const isVotingPhase = workflowStatus === WORKFLOW_STATUS.VotingSessionStarted;
  const isVotingEnded = workflowStatus && workflowStatus >= WORKFLOW_STATUS.VotingSessionEnded;
  const showVoteCounts = isVotingPhase || isVotingEnded;
  const canVote = isVotingPhase && !hasVoted;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Liste des propositions</CardTitle>
        <CardDescription>
          {isLoadingProposals ? (
            'Chargement...'
          ) : (
            <>
              {proposals.length} proposition(s) enregistrée(s)
              {hasVoted && (
                <span className="ml-2 text-green-600 font-semibold">
                  • Vous avez voté pour la proposition #{votedProposalId}
                </span>
              )}
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingProposals ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 mt-2">
              Chargement des propositions depuis les événements...
            </p>
          </div>
        ) : proposals.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Aucune proposition pour le moment.</p>
        ) : (
          <div className="space-y-3">
            {proposals.map((proposal) => {
              const isVotedProposal = hasVoted && votedProposalId === proposal.id;
              const isCurrentlyVoting = isVoting && votingForId === proposal.id;

              return (
                <div
                  key={proposal.id}
                  className={`border rounded-lg p-4 transition-all ${
                    isVotedProposal ? 'border-green-500 bg-green-50' : 'hover:bg-background'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-700">#{proposal.id}</span>
                        {proposal.id === 0 && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            GENESIS
                          </span>
                        )}
                        {isVotedProposal && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Votre vote
                          </span>
                        )}
                      </div>
                      <p className="text-gray-900">{proposal.description}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      {showVoteCounts && (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {proposal.voteCount.toString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {proposal.voteCount === 1n ? 'vote' : 'votes'}
                          </div>
                        </div>
                      )}

                      {canVote && (
                        <Button
                          size="sm"
                          onClick={() => handleVote(proposal.id)}
                          disabled={isVoting}
                          className={isCurrentlyVoting ? 'opacity-50' : ''}
                        >
                          {isCurrentlyVoting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Vote...
                            </>
                          ) : (
                            <>
                              <Vote className="h-4 w-4 mr-2" />
                              Voter
                            </>
                          )}
                        </Button>
                      )}

                      {isVotedProposal && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled
                          className="bg-green-100 border-green-500 text-green-700"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Voté
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {isConfirmed && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm font-medium flex items-center gap-2">
              <Check className="h-4 w-4" />
              Vote enregistré avec succès !
            </p>
          </div>
        )}

        {isError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">Erreur : {error?.message}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
