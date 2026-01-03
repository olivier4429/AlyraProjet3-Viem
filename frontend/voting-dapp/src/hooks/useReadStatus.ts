import { useReadContract } from 'wagmi'
import { getAddress } from 'viem'
import { CONTRACT_ABI } from '../abi/voting'
import { CONTRACT_ADDRESS } from "../constants";



export function useReadStatus() {
  const addressChecksum = getAddress(CONTRACT_ADDRESS);

  const { data: workflowStatus, isLoading,
    isError,
    error,
    isSuccess } = useReadContract({
      address: addressChecksum,
      abi: CONTRACT_ABI,
      functionName: "workflowStatus",

    });

  // Logs pour debug direct dans la console
  console.log('🔍 useReadStatus workflowStatus:', {
    workflowStatus,
    isLoading,
    isSuccess,
    isError,
    error: error?.message || error
  })

  return {
    workflowStatus,
    isLoading,
    isError,
    error
  }
}
export default useReadStatus;
