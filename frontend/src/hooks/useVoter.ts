import { useReadContract } from 'wagmi';
import { type Address } from 'viem';
import { CONTRACT_ABI } from '@/abi/voting';
import { CONTRACT_ADDRESS } from '@/constants';

export function useVoter(addressConnected?: Address, workflowStatus?: number) {
  const {
    data: voterInfo,
    isLoading,
    isError,
    error,
    refetch,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getVoter',
    args: addressConnected ? [addressConnected] : undefined,
    query: {
      enabled: Boolean(addressConnected && workflowStatus !== undefined),
      retry: false,
    },
  });

  return {
    voterInfo,
    isLoading,
    isError,
    error,
    refetch,
  };
}

export default useVoter;
