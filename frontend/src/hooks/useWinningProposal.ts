import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS } from '@/constants';
import { CONTRACT_ABI } from '@/abi/voting';

export function useWinningProposal(enabled: boolean) {
  const { data: winningProposalID, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'winningProposalID',
    query: {
      enabled,
    },
  });

  return {
    winningId: winningProposalID !== undefined ? Number(winningProposalID) : null,
    isLoading,
    refetch,
  };
}

export default useWinningProposal;
