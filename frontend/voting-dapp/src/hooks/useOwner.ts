import { useReadContract } from 'wagmi';
import { isAddressEqual, type Address } from 'viem';
import { CONTRACT_ABI } from '@/abi/voting';
import { CONTRACT_ADDRESS } from "@/constants";

export function useOwner(addressConnected?: Address) {
  
  const {
    data: owner,
    isLoading,
    isError,
    error,
    isSuccess,
    refetch,
  } = useReadContract({
    abi: CONTRACT_ABI,
    address: CONTRACT_ADDRESS,
    functionName: 'owner',
    query: {
      enabled: Boolean(addressConnected),
    },
  });

  return {
    owner,
    isOwner: addressConnected && owner ? isAddressEqual(addressConnected, owner) : false,
    isLoading,
    isError,
    error,
    isSuccess,
    refetch,
  };
}

export default useOwner;