
import { useState, useCallback, useEffect } from 'react';
import { usePublicClient, useWatchContractEvent } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_DEPLOYMENT_BLOCK } from '@/constants';
import { CONTRACT_ABI } from '@/abi/voting';
import { useApp } from '@/contexts/AppContext';
import { type Proposal } from '@/types';

export function useProposals() {
    const { isConnected, isVoter } = useApp();
    const [proposalIds, setProposalIds] = useState<number[]>([]);
    const [proposals, setProposals] = useState<(Proposal & { id: number })[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const publicClient = usePublicClient();

    // Charger les IDs depuis les événements
    const fetchProposalIds = useCallback(async () => {
        if (!publicClient) return;

        try {
            const logs = await publicClient.getLogs({
                address: CONTRACT_ADDRESS,
                event: {
                    type: 'event',
                    name: 'ProposalRegistered',
                    inputs: [{ type: 'uint256', name: 'proposalId', indexed: false }],
                },
                fromBlock: CONTRACT_DEPLOYMENT_BLOCK,
                toBlock: 'latest',
            });

            const ids = logs.map(log => Number(log.args.proposalId));
            const uniqueIds = [...new Set(ids)].sort((a, b) => a - b);
            setProposalIds(uniqueIds);
        } catch (error) {
            console.error('Erreur chargement IDs propositions:', error);
            setProposalIds([0]);
        }
    }, [publicClient]);

    // Charger les détails des propositions
    const fetchProposals = useCallback(async () => {
        if (!publicClient || proposalIds.length === 0) return;

        setIsLoading(true);
        try {
            const fetched = await Promise.all(
                proposalIds.map(async (id) => {
                    try {
                        const result = await publicClient.readContract({
                            address: CONTRACT_ADDRESS,
                            abi: CONTRACT_ABI,
                            functionName: 'getOneProposal',
                            args: [BigInt(id)],
                        });
                        return { id, ...(result as Proposal) };
                    } catch {
                        return null;
                    }
                })
            );

            setProposals(fetched.filter((p): p is Proposal & { id: number } => 
                p !== null && p.description !== undefined
            ));
        } catch (error) {
            console.error('Erreur chargement propositions:', error);
        } finally {
            setIsLoading(false);
        }
    }, [publicClient, proposalIds]);

    // Chargement initial des IDs
    useEffect(() => {
        if (isConnected && isVoter) {
            fetchProposalIds();
        }
    }, [isConnected, isVoter, fetchProposalIds]);

    // Chargement des détails quand les IDs changent
    useEffect(() => {
        if (isConnected && isVoter) {
            fetchProposals();
        }
    }, [proposalIds, isConnected, isVoter, fetchProposals]);

    // Écouter nouvelles propositions
    useWatchContractEvent({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        eventName: 'ProposalRegistered',
        onLogs(logs) {
            logs.forEach(log => {
                const id = Number(log.args.proposalId);
                setProposalIds(prev => 
                    prev.includes(id) ? prev : [...prev, id].sort((a, b) => a - b)
                );
            });
        },
    });

    // Écouter les votes
    useWatchContractEvent({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        eventName: 'Voted',
        onLogs() {
            fetchProposals();
        },
    });

    return {
        proposals,
        isLoading,
        refetchProposals: fetchProposals,
    };
}

export default useProposals;