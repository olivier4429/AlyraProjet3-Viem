import { useReadContract } from 'wagmi'
import { Address, isAddressEqual } from 'viem'
import { votingAbi } from '../abi/voting'


export function useIsOwner(address?:Address) {

  const { data: owner } = useReadContract({
    abi: votingAbi,
    address: "0x5fbdb2315678afecb367f032d93f642f64180aa3",
    functionName: 'owner',
    query:{
      enabled : !!address,  //Ne pas appeler si l'adresse n'est pas renseignée.
    }
  })
  return Boolean(
    address &&
    owner &&
    isAddressEqual(address, owner)
  )
}
export default useIsOwner;
