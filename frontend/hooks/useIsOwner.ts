import { useReadContract } from 'wagmi'
import { isAddressEqual } from 'viem'
import { votingAbi } from '../abi/voting'
import { useAccount } from 'wagmi'


export function useIsOwner() {
   const { address, isConnected } = useAccount();

  const { data: owner } = useReadContract({
    abi: votingAbi,
    address: "0x5fbdb2315678afecb367f032d93f642f64180aa3",
    functionName: 'owner',
  })

  return Boolean(
    address &&
    owner &&
    isAddressEqual(address, owner)
  )
}
export default useIsOwner;
