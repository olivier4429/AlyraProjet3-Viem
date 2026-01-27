import { useApp } from '@/contexts/AppContext';
import { useProposals, useWinningProposal } from '@/hooks';
import { WORKFLOW_STATUS } from '@/constants';
import CustomMessageCard from '@/components/shared/CustomMessageCard';
import { Trophy, Medal, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const TITLE = 'Résultats du vote';

const getPositionIcon = (index: number) => {
  switch (index) {
    case 0:
      return <Trophy className="h-6 w-6 text-yellow-500" />;
    case 1:
      return <Medal className="h-6 w-6 text-gray-400" />;
    case 2:
      return <Award className="h-6 w-6 text-orange-600" />;
    default:
      return null;
  }
};

const getPositionStyle = (index: number, isWinner: boolean) => {
  if (isWinner) return 'border-yellow-400 bg-yellow-50 shadow-lg';
  switch (index) {
    case 1:
      return 'border-gray-300 bg-background';
    case 2:
      return 'border-orange-300 bg-orange-50';
    default:
      return 'border-gray-200';
  }
};

export default function VoteResults() {
  const { isConnected, isVoter, workflowStatus } = useApp();

  const isResultsPhase = workflowStatus === WORKFLOW_STATUS.VotesTallied;

  // Réutilisation du hook useProposals avec tri par votes
  const { proposals, isLoading: isLoadingProposals } = useProposals({
    enabled: isConnected && isVoter && isResultsPhase,
    sortByVotes: true,
  });

  const { winningId } = useWinningProposal(isConnected && isVoter && isResultsPhase);

  // Vérifications d'accès
  if (!isConnected) {
    return (
      <CustomMessageCard title={TITLE}>
        ⚠️ Connectez votre wallet pour voir les résultats.
      </CustomMessageCard>
    );
  }

  if (!isResultsPhase) {
    return (
      <CustomMessageCard title={TITLE}>
        ⏸️ Les résultats ne sont pas encore disponibles. Les votes doivent d'abord être
        comptabilisés.
      </CustomMessageCard>
    );
  }

  const totalVotes = proposals.reduce((sum, p) => sum + Number(p.voteCount), 0);
  const winningProposal = proposals.find((p) => p.id === winningId);

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          Résultats du vote
        </CardTitle>
        <CardDescription>
          {proposals.length} proposition(s) • {totalVotes} vote(s) au total
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingProposals ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 mt-2">Chargement des résultats...</p>
          </div>
        ) : proposals.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Aucune proposition trouvée.</p>
        ) : (
          <>
            {/* Gagnant en vedette */}
            {winningProposal && (
              <div className="mb-6 p-6 border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow-lg">
                <div className="flex items-start gap-4">
                  <Trophy className="h-12 w-12 text-yellow-500 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      🎉 Proposition gagnante
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-lg text-gray-700">
                        Proposition #{winningProposal.id}
                      </span>
                      {winningProposal.id === 0 && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          GENESIS
                        </span>
                      )}
                    </div>
                    <p className="text-gray-900 text-lg mb-3">{winningProposal.description}</p>
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-bold text-yellow-600">
                        {winningProposal.voteCount.toString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {winningProposal.voteCount === 1n ? 'vote' : 'votes'}
                        {totalVotes > 0 && (
                          <span className="ml-2">
                            ({Math.round((Number(winningProposal.voteCount) / totalVotes) * 100)}%)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Classement complet */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700 mb-3">Classement complet</h4>
              {proposals.map((proposal, index) => {
                const isWinner = proposal.id === winningId;
                const percentage =
                  totalVotes > 0 ? (Number(proposal.voteCount) / totalVotes) * 100 : 0;

                return (
                  <div
                    key={proposal.id}
                    className={`border-2 rounded-lg p-4 transition-all ${getPositionStyle(index, isWinner)}`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Position */}
                      <div className="flex-shrink-0 w-12 text-center">
                        {getPositionIcon(index) || (
                          <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                        )}
                      </div>

                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-700">
                            Proposition #{proposal.id}
                          </span>
                          {proposal.id === 0 && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              GENESIS
                            </span>
                          )}
                          {isWinner && (
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-semibold">
                              GAGNANT
                            </span>
                          )}
                        </div>
                        <p className="text-gray-900 mb-2">{proposal.description}</p>

                        {/* Barre de progression */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-semibold text-gray-700">
                              {proposal.voteCount.toString()}{' '}
                              {proposal.voteCount === 1n ? 'vote' : 'votes'}
                            </span>
                            <span className="text-gray-600">{percentage.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                            <div
                              className={`h-2.5 rounded-full transition-all duration-500 ${
                                isWinner ? 'bg-yellow-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
