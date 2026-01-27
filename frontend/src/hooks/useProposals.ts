import { useState, useCallback, useEffect, useMemo } from 'react';
import { usePublicClient, useWatchContractEvent } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_DEPLOYMENT_BLOCK } from '@/constants';
import { CONTRACT_ABI } from '@/abi/voting';
import { type Proposal } from '@/types';

interface UseProposalsOptions {
  enabled?: boolean;
  sortByVotes?: boolean;
}

export function useProposals(options: UseProposalsOptions = {}) {
  const { enabled = true, sortByVotes = false } = options;
  
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

      const ids = logs.map((log) => Number(log.args.proposalId));
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

      const validProposals = fetched.filter(
        (p): p is Proposal & { id: number } => p !== null && p.description !== undefined
      );

      setProposals(validProposals);
    } catch (error) {
      console.error('Erreur chargement propositions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, proposalIds]);

  // Chargement initial des IDs
  useEffect(() => {
    if (enabled) {
      fetchProposalIds();
    }
  }, [enabled, fetchProposalIds]);

  // Chargement des détails quand les IDs changent
  useEffect(() => {
    if (enabled) {
      fetchProposals();
    }
  }, [proposalIds, enabled, fetchProposals]);

  // Écouter nouvelles propositions
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    eventName: 'ProposalRegistered',
    onLogs(logs) {
      logs.forEach((log) => {
        const id = Number(log.args.proposalId);
        setProposalIds((prev) =>
          prev.includes(id) ? prev : [...prev, id].sort((a, b) => a - b)
        );
      });
    },
  });

  // Écouter les votes pour rafraîchir les compteurs
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    eventName: 'Voted',
    onLogs() {
      fetchProposals();
    },
  });

  // Tri optionnel par votes
  const sortedProposals = useMemo(() => {
    if (!sortByVotes) return proposals;
    return [...proposals].sort((a, b) => Number(b.voteCount) - Number(a.voteCount));
  }, [proposals, sortByVotes]);

  return {
    proposals: sortedProposals,
    isLoading,
    refetchProposals: fetchProposals,
  };
}

export default useProposals;
