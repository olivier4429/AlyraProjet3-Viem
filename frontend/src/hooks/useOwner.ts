import { useReadContract } from 'wagmi';
import { isAddressEqual, type Address } from 'viem';
import { CONTRACT_ABI } from '@/abi/voting';
import { CONTRACT_ADDRESS } from '@/constants';

export function useOwner(addressConnected?: Address) {
  const {
    data: owner,
    isLoading,
    isError,
    error,
    refetch,
  } = useReadContract({
    abi: CONTRACT_ABI,
    address: CONTRACT_ADDRESS,
    functionName: 'owner',
    query: {
      enabled: Boolean(addressConnected),
      retry: false,
    },
  });

  const isOwner = addressConnected && owner 
    ? isAddressEqual(addressConnected, owner) 
    : false;

  return {
    owner,
    isOwner,
    isLoading,
    isError,
    error,
    refetch,
  };
}

export default useOwner;
