import { useReadContract, useAccount } from "wagmi";
import { CONTRACT_ADDRESS } from "../constants";
import { CONTRACT_ABI } from '../abi/voting';
import { useOwner } from '../contexts/OwnerContext';
import CustomMessageCard from "@/components/CustomMessageCard";
import { type Proposal } from "@/types";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import useStatusVoter from "@/hooks/useStatusVoter";



export default function ProposalsList() {
    const TITLE = "Liste des propositions";
    const { isConnected } = useOwner();
    const { address } = useAccount();

    const  voterInfo  =useStatusVoter();

    /* ===== READ WORKFLOW STATUS ===== */
    const { data: workflowStatus } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "workflowStatus",
    });

    /* ===== FETCH PROPOSALS ===== */
    // On essaie de récupérer jusqu'à 100 propositions (MAX_PROPOSALS)
    const proposalQueries = Array.from({ length: 100 }, (_, i) =>
        useReadContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: "getOneProposal",
            args: [BigInt(i)],
        })
    );

    /* ===== CHECKS ===== */
    if (!isConnected) {
        return (
            <CustomMessageCard title={TITLE}>
                ⚠️ Connectez votre wallet pour voir les propositions.
            </CustomMessageCard>
        );
    }

    const isVoter = voterInfo && (voterInfo as any).isRegistered;

    if (!isVoter) {
        return (
            <CustomMessageCard title={TITLE}>
                ❌ Vous n'êtes pas enregistré comme votant.
            </CustomMessageCard>
        );
    }

    // Filtrer les propositions valides
    const proposals: (Proposal & { id: number })[] = proposalQueries
        .map((query, index) => ({
            id: index,
            ...(query.data as Proposal),
        }))
        .filter((p) => p.description !== undefined);

    const isVotingPhase = workflowStatus === 3; // VotingSessionStarted
    const isVotingEnded = workflowStatus && workflowStatus >= 4; // VotingSessionEnded or VotesTallied

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle>Liste des propositions</CardTitle>
                <CardDescription>
                    {proposals.length} proposition(s) enregistrée(s)
                </CardDescription>
            </CardHeader>
            <CardContent>
                {proposals.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                        Aucune proposition pour le moment.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {proposals.map((proposal) => (
                            <div
                                key={proposal.id}
                                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
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
                                        </div>
                                        <p className="text-gray-900">
                                            {proposal.description}
                                        </p>
                                    </div>
                                    {(isVotingPhase || isVotingEnded) && (
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {proposal.voteCount.toString()}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {proposal.voteCount === 1n ? "vote" : "votes"}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}