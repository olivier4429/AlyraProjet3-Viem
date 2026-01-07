import { useReadContract } from 'wagmi'
import { CONTRACT_ABI } from '../abi/voting'
import { CONTRACT_ADDRESS } from "../constants";
import { getAddress, type Address } from 'viem';
import { type Voter } from '@/types';



export function useStatusVoter(address?: Address, queryNeeded?: boolean): Voter | undefined  {
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
  return voter as Voter | undefined;
}
export default useStatusVoter;
