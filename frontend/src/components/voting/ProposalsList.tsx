import { useWatchContractEvent, usePublicClient , useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useState, useEffect } from "react";
import { CONTRACT_ADDRESS } from "@/constants";
import { CONTRACT_ABI } from '@/abi/voting';
import { useApp } from '@/contexts/AppContext';
import CustomMessageCard from "@/components/shared/CustomMessageCard";
import { type Proposal } from "@/types";
import { Button } from "@/components/ui/button";
import { Check, Vote } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";


/**
### **Flux de données**
```
1. Montage du composant
   ↓
2. publicClient.getLogs() → Récupère tous les événements passés
   ↓
3. setProposalIds([0, 1, 2, 3...]) → Met à jour les IDs
   ↓
4. useEffect sur proposalIds → Récupère les détails de chaque proposition
   ↓
5. setProposals([...]) → Affiche les propositions
   ↓
6. useWatchContractEvent → Écoute en temps réel les nouvelles propositions
*/
export default function ProposalsList() {
    const TITLE = "Liste des propositions";
    const { isConnected, isVoter, voterInfo, workflowStatus, refetchAll } = useApp();
    const [proposalIds, setProposalIds] = useState<number[]>([]);
    const [proposals, setProposals] = useState<(Proposal & { id: number })[]>([]);
    const [isLoadingProposals, setIsLoadingProposals] = useState(false);
    const [votingForId, setVotingForId] = useState<number | null>(null);
    const publicClient = usePublicClient();

    // Write contract pour voter
    const { writeContract, data: hash, isPending, isError, error } = useWriteContract();
    const { isSuccess: isConfirmed, isLoading: isMining } = useWaitForTransactionReceipt({ hash });

    const isVoting = isPending || isMining;
    const hasVoted = voterInfo?.hasVoted ?? false;
    const votedProposalId = voterInfo?.votedProposalId ? Number(voterInfo.votedProposalId) : null;

    // Écouter les nouveaux événements ProposalRegistered en temps réel
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

    // Charger les propositions existantes depuis les événements passés
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
                    fromBlock: 'earliest',
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

    // Récupérer les détails de chaque proposition
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
                
                setProposals(validProposals);
            } catch (error) {
                console.error('Erreur lors de la récupération des propositions:', error);
            }
        };

        fetchProposals();
    }, [proposalIds, isConnected, isVoter, publicClient, workflowStatus]);

    // Refetch après vote réussi
    useEffect(() => {
        if (isConfirmed) {
            setVotingForId(null);
            refetchAll();
        }
    }, [isConfirmed, refetchAll]);

    // Fonction pour voter
    const handleVote = (proposalId: number) => {
        setVotingForId(proposalId);
        writeContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: "setVote",
            args: [BigInt(proposalId)],
        });
    };

    // Vérifications
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

    const isVotingPhase = workflowStatus === 3;
    const isVotingEnded = workflowStatus && workflowStatus >= 4;
    const showVoteCounts = isVotingPhase || isVotingEnded;
    const canVote = isVotingPhase && !hasVoted;

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle>Liste des propositions</CardTitle>
                <CardDescription>
                    {isLoadingProposals ? (
                        "Chargement..."
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
                        <p className="text-gray-500 mt-2">Chargement des propositions depuis les événements...</p>
                    </div>
                ) : proposals.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                        Aucune proposition pour le moment.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {proposals.map((proposal) => {
                            const isVotedProposal = hasVoted && votedProposalId === proposal.id;
                            const isCurrentlyVoting = isVoting && votingForId === proposal.id;

                            return (
                                <div
                                    key={proposal.id}
                                    className={`border rounded-lg p-4 transition-all ${
                                        isVotedProposal
                                            ? 'border-green-500 bg-green-50'
                                            : 'hover:bg-background'
                                    }`}
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-gray-700">
                                                    #{proposal.id}
                                                </span>
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
                                            <p className="text-gray-900">
                                                {proposal.description}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {showVoteCounts && (
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-blue-600">
                                                        {proposal.voteCount.toString()}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {proposal.voteCount === 1n ? "vote" : "votes"}
                                                    </div>
                                                </div>
                                            )}

                                            {canVote && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleVote(proposal.id)}
                                                    disabled={isVoting}
                                                    className={isCurrentlyVoting ? "opacity-50" : ""}
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

                {/* Messages d'erreur ou de succès globaux */}
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
                        <p className="text-red-700 text-sm">
                            Erreur : {error?.message}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}