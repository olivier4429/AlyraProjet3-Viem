import { useReadContract } from 'wagmi'
import { getAddress, isAddressEqual, type Address } from 'viem'
import { CONTRACT_ABI } from '../abi/voting'
import { CONTRACT_ADDRESS } from "../constants";



export function useIsOwner(address?: Address) {
  const addressChecksum = getAddress(CONTRACT_ADDRESS);
  const {
    data: owner,
    isLoading,
    isError,
    error,
    isSuccess,
    refetch // pour forcer un refresh manuel
  } = useReadContract({
    abi: CONTRACT_ABI,
    address: addressChecksum,
    functionName: 'owner',
    query: {
      enabled: !!address,  //Ne pas appeler si l'adresse n'est pas renseignée.
    }
  })

  // Retourne l'owner pour l'instant (comme tu fais déjà)
  return {
    owner,
    isOwner: address && owner ? isAddressEqual(address, owner) : false,
    isLoading,
    isError,
    error,
    isSuccess,
    refetch // utile pour tester manuellement
  }
}
export default useIsOwner;
