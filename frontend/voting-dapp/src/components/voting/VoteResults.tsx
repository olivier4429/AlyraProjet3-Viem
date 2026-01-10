import { useWatchContractEvent, usePublicClient, useReadContract } from "wagmi";
import { useState, useEffect } from "react";
import { CONTRACT_ADDRESS } from "@/constants";
import { CONTRACT_ABI } from '@/abi/voting';
import { useApp } from '@/contexts/AppContext';
import CustomMessageCard from "@/components/shared/CustomMessageCard";
import { type Proposal } from "@/types";
import { Trophy, Medal, Award } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function VoteResults() {
    const TITLE = "Résultats du vote";
    const { isConnected, isVoter, workflowStatus } = useApp();
    const [proposalIds, setProposalIds] = useState<number[]>([]);
    const [proposals, setProposals] = useState<(Proposal & { id: number })[]>([]);
    const [isLoadingProposals, setIsLoadingProposals] = useState(false);
    const publicClient = usePublicClient();

    // Récupérer le winningProposalID
    const { data: winningProposalID } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'winningProposalID',
        query: {
            enabled: isConnected && isVoter && workflowStatus === 5,
        },
    });

    const winningId = winningProposalID ? Number(winningProposalID) : null;

    // Écouter les événements ProposalRegistered
    useWatchContractEvent({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        eventName: 'ProposalRegistered',
        onLogs(logs) {
            logs.forEach(log => {
                const proposalId = Number(log.args.proposalId);
                setProposalIds(prev => {
                    if (prev.includes(proposalId)) return prev;
                    return [...prev, proposalId].sort((a, b) => a - b);
                });
            });
        },
    });

    // Charger les propositions existantes
    useEffect(() => {
        if (!isConnected || !isVoter || !publicClient) return;

        const loadPastProposals = async () => {
            setIsLoadingProposals(true);
            try {
                const logs = await publicClient.getLogs({
                    address: CONTRACT_ADDRESS,
                    event: {
                        type: 'event',
                        name: 'ProposalRegistered',
                        inputs: [
                            {
                                type: 'uint256',
                                name: 'proposalId',
                                indexed: false,
                            }
                        ],
                    },
                    fromBlock: 0n,
                    toBlock: 'latest',
                });

                const ids = logs.map(log => Number(log.args.proposalId));
                const uniqueIds = Array.from(new Set(ids)).sort((a, b) => a - b);
                setProposalIds(uniqueIds);
            } catch (error) {
                console.error('Erreur lors du chargement des événements:', error);
                setProposalIds([0]);
            } finally {
                setIsLoadingProposals(false);
            }
        };

        loadPastProposals();
    }, [isConnected, isVoter, publicClient]);

    // Récupérer les détails des propositions
    useEffect(() => {
        if (!isConnected || !isVoter || !publicClient || proposalIds.length === 0) return;

        const fetchProposals = async () => {
            try {
                const fetchedProposals = await Promise.all(
                    proposalIds.map(async (id) => {
                        try {
                            const result = await publicClient.readContract({
                                address: CONTRACT_ADDRESS,
                                abi: CONTRACT_ABI,
                                functionName: 'getOneProposal',
                                args: [BigInt(id)],
                            });
                            return {
                                id,
                                ...(result as Proposal),
                            };
                        } catch (error) {
                            console.error(`Erreur pour la proposition ${id}:`, error);
                            return null;
                        }
                    })
                );

                const validProposals = fetchedProposals.filter(
                    (p): p is Proposal & { id: number } => p !== null && p.description !== undefined
                );
                
                // Trier par nombre de votes (décroissant)
                const sortedProposals = validProposals.sort((a, b) => {
                    return Number(b.voteCount) - Number(a.voteCount);
                });
                
                setProposals(sortedProposals);
            } catch (error) {
                console.error('Erreur lors de la récupération des propositions:', error);
            }
        };

        fetchProposals();
    }, [proposalIds, isConnected, isVoter, publicClient, workflowStatus]);

    // Vérifications
    if (!isConnected) {
        return (
            <CustomMessageCard title={TITLE}>
                ⚠️ Connectez votre wallet pour voir les résultats.
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

    if (workflowStatus !== 5) {
        return (
            <CustomMessageCard title={TITLE}>
                ⏸️ Les résultats ne sont pas encore disponibles. Les votes doivent d'abord être comptabilisés.
            </CustomMessageCard>
        );
    }

    // Calculer les statistiques
    const totalVotes = proposals.reduce((sum, p) => sum + Number(p.voteCount), 0);
    const winningProposal = proposals.find(p => p.id === winningId);

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
        if (isWinner) {
            return "border-yellow-400 bg-yellow-50 shadow-lg";
        }
        switch (index) {
            case 1:
                return "border-gray-300 bg-background";
            case 2:
                return "border-orange-300 bg-orange-50";
            default:
                return "border-gray-200";
        }
    };

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
                    <p className="text-gray-500 text-center py-4">
                        Aucune proposition trouvée.
                    </p>
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
                                        <p className="text-gray-900 text-lg mb-3">
                                            {winningProposal.description}
                                        </p>
                                        <div className="flex items-center gap-4">
                                            <div className="text-3xl font-bold text-yellow-600">
                                                {winningProposal.voteCount.toString()}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {winningProposal.voteCount === 1n ? "vote" : "votes"}
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
                                const percentage = totalVotes > 0 
                                    ? (Number(proposal.voteCount) / totalVotes) * 100 
                                    : 0;

                                return (
                                    <div
                                        key={proposal.id}
                                        className={`border-2 rounded-lg p-4 transition-all ${getPositionStyle(index, isWinner)}`}
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Position */}
                                            <div className="flex-shrink-0 w-12 text-center">
                                                {getPositionIcon(index) || (
                                                    <span className="text-2xl font-bold text-gray-400">
                                                        #{index + 1}
                                                    </span>
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
                                                <p className="text-gray-900 mb-2">
                                                    {proposal.description}
                                                </p>

                                                {/* Barre de progression */}
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="font-semibold text-gray-700">
                                                            {proposal.voteCount.toString()} {proposal.voteCount === 1n ? "vote" : "votes"}
                                                        </span>
                                                        <span className="text-gray-600">
                                                            {percentage.toFixed(1)}%
                                                        </span>
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