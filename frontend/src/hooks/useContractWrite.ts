import { useCallback, useEffect, useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS } from '@/constants';
import { CONTRACT_ABI } from '@/abi/voting';

type ContractFunctionName = 
  | 'addVoter' 
  | 'addProposal' 
  | 'setVote' 
  | 'startProposalsRegistering'
  | 'endProposalsRegistering'
  | 'startVotingSession'
  | 'endVotingSession'
  | 'tallyVotes';

interface UseContractWriteOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useContractWrite(options: UseContractWriteOptions = {}) {
  const [lastFunctionCalled, setLastFunctionCalled] = useState<string | null>(null);
  
  const { 
    writeContract, 
    data: hash, 
    isPending, 
    isError, 
    error,
    reset 
  } = useWriteContract();
  
  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed 
  } = useWaitForTransactionReceipt({ hash });

  const isLoading = isPending || isConfirming;

  // Callback de succès
  useEffect(() => {
    if (isConfirmed && options.onSuccess) {
      options.onSuccess();
    }
  }, [isConfirmed, options.onSuccess]);

  // Callback d'erreur
  useEffect(() => {
    if (isError && error && options.onError) {
      options.onError(error);
    }
  }, [isError, error, options.onError]);

  const write = useCallback(<T extends ContractFunctionName>(
    functionName: T,
    args?: readonly unknown[]
  ) => {
    setLastFunctionCalled(functionName);
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName,
      args: args as never,
    });
  }, [writeContract]);

  return {
    write,
    hash,
    isLoading,
    isPending,
    isConfirming,
    isConfirmed,
    isError,
    error,
    reset,
    lastFunctionCalled,
  };
}

export default useContractWrite;
