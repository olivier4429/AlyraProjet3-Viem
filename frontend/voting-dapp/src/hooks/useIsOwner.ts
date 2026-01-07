import { useReadContract } from 'wagmi';
import { getAddress, isAddressEqual, type Address } from 'viem';
import { CONTRACT_ABI } from '@/abi/voting';
import { CONTRACT_ADDRESS } from "@/constants";

export function useIsOwner(address?: Address) {
  const addressChecksum = getAddress(CONTRACT_ADDRESS);
  
  const {
    data: owner,
    isLoading,
    isError,
    error,
    isSuccess,
    refetch,
  } = useReadContract({
    abi: CONTRACT_ABI,
    address: addressChecksum,
    functionName: 'owner',
    query: {
      enabled: Boolean(address),
    },
  });

  return {
    owner,
    isOwner: address && owner ? isAddressEqual(address, owner) : false,
    isLoading,
    isError,
    error,
    isSuccess,
    refetch,
  };
}

export default useIsOwner;