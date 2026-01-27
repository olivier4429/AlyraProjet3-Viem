import { useReadContract } from 'wagmi';
import { CONTRACT_ABI } from '@/abi/voting';
import { CONTRACT_ADDRESS } from '@/constants';

export function useWorkflowStatus(isConnected: boolean) {
  const {
    data: workflowStatus,
    isLoading,
    isError,
    error,
    refetch,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'workflowStatus',
    query: {
      enabled: isConnected,
    },
  });

  return {
    workflowStatus,
    isLoading,
    isError,
    error,
    refetch,
  };
}

export default useWorkflowStatus;
