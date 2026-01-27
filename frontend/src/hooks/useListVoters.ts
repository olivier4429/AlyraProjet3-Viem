import { useState, useCallback, useEffect } from 'react';
import type { Address } from 'viem';
import { usePublicClient, useWatchContractEvent } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_DEPLOYMENT_BLOCK } from '@/constants';
import { CONTRACT_ABI } from '@/abi/voting';

export function useListVoters(isConnected: boolean) {
  const [voters, setVoters] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const publicClient = usePublicClient();

  const fetchVoters = useCallback(async () => {
    if (!publicClient) return;

    setIsLoading(true);
    try {
      const logs = await publicClient.getLogs({
        address: CONTRACT_ADDRESS,
        event: {
          type: 'event',
          name: 'VoterRegistered',
          inputs: [{ type: 'address', name: 'voterAddress', indexed: false }],
        },
        fromBlock: CONTRACT_DEPLOYMENT_BLOCK,
        toBlock: 'latest',
      });

      const addressesList = logs.map((log) => log.args.voterAddress as Address);
      setVoters(addressesList);
    } catch (err) {
      console.error('Erreur lors de la récupération des votants:', err);
      setVoters([]);
    } finally {
      setIsLoading(false);
    }
  }, [publicClient]);

  // Chargement initial
  useEffect(() => {
    if (!isConnected || !publicClient) return;
    fetchVoters();
  }, [isConnected, publicClient, fetchVoters]);

  // Écoute des nouveaux événements en temps réel
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    eventName: 'VoterRegistered',
    onLogs(logs) {
      const newAddresses = logs.map((log) => log.args.voterAddress as Address);

      setVoters((prev) => {
        const combined = [...prev];
        for (const addr of newAddresses) {
          if (!combined.some((v) => v.toLowerCase() === addr.toLowerCase())) {
            combined.push(addr);
          }
        }
        return combined;
      });
    },
  });

  return {
    voters,
    isLoading,
    refetchVoters: fetchVoters,
  };
}

export default useListVoters;
