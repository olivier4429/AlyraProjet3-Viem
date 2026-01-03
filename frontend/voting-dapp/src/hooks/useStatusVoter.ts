import { useReadContract } from 'wagmi'
import { CONTRACT_ABI } from '../abi/voting'
import { CONTRACT_ADDRESS } from "../constants";
import { getAddress, type Address } from 'viem';


export function useStatusVoter(address?: Address, queryNeeded?: boolean) {
  const addressChecksum = getAddress(CONTRACT_ADDRESS);
  const { data: voter } = useReadContract({
    abi: CONTRACT_ABI,
    address: addressChecksum,
    functionName: 'getVoter',
    args: address ? [address] : undefined,
    query: {
      enabled: queryNeeded && Boolean(address), //Ne pas appeler si adress undefined.
    },
  })
  return voter;
}
export default useStatusVoter;
