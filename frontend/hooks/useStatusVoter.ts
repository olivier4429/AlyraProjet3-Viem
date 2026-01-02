import { useReadContract } from 'wagmi'
import { Address } from 'viem'
import { votingAbi } from '../abi/voting'


export function useStatusVoter(address?: Address, queryNeeded?: boolean) {

  const { data: voter } = useReadContract({
    abi: votingAbi,
    address: "0x5fbdb2315678afecb367f032d93f642f64180aa3",
    functionName: 'getVoter',
    args: address ? [address] : undefined,
    query: {
      enabled: queryNeeded && Boolean(address), //Ne pas appeler si adress undefined.
    },
  })
  return voter;
}
export default useStatusVoter;
