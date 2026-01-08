import { useReadContract } from 'wagmi';
import { type Address } from 'viem';
import { CONTRACT_ABI } from '@/abi/voting';
import { CONTRACT_ADDRESS, WORKFLOW_STATUS, } from "@/constants";

export function useVoter(addressConnected?: Address, workflowStatus?:number) {

  // Voter info
  const {
    data: voterInfo,
    isLoading,
    isError,
    error,
    isSuccess,
    refetch,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getVoter',
    args: addressConnected ? [addressConnected] : undefined,
    query: {
      enabled: Boolean(addressConnected && workflowStatus !== undefined &&
        workflowStatus > WORKFLOW_STATUS.RegisteringVoters),
    },
  });


  return {
    voterInfo,
    isLoading,
    isError,
    error,
    isSuccess,
    refetch,
  };
}

export default useVoter;