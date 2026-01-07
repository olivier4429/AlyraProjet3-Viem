import { createContext, useContext, type ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, WORKFLOW_LABELS, WORKFLOW_STATUS } from '../constants';
import { CONTRACT_ABI } from '@/abi/voting';
import { type Voter } from '@/types';
import useIsOwner from '@/hooks/useIsOwner';

interface AppContextType {
  // Connexion
  address: string | undefined;
  isConnected: boolean;
  
  // Owner
  isOwner: boolean;
  isOwnerLoading: boolean;
  ownerAddress: string | undefined;
  
  // Voter
  voterInfo: Voter | undefined;
  isVoter: boolean;
  isVoterLoading: boolean;
  
  // Workflow
  workflowStatus: number | undefined;
  workflowLabel: string;
  isWorkflowLoading: boolean;
  
  // Actions
  refetchAll: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  
  // Owner info
  const {
    owner,
    isOwner,
    isLoading: isOwnerLoading,
    refetch: refetchOwner,
  } = useIsOwner(address);
  
    // Workflow status
  const {
    data: workflowStatus,
    isLoading: isWorkflowLoading,
    refetch: refetchWorkflow,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'workflowStatus',
    query: {
      enabled: isConnected,
    },
  });

  // Voter info
  const {
    data: voterInfo,
    isLoading: isVoterLoading,
    refetch: refetchVoter,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getVoter',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address && isConnected && workflowStatus !== undefined && 
    workflowStatus !== WORKFLOW_STATUS.RegisteringVoters),
    },
  });
  

  
  const value: AppContextType = {
    address,
    isConnected,
    isOwner: isOwner ?? false,
    isOwnerLoading,
    ownerAddress: owner,
    voterInfo: voterInfo as Voter | undefined,
    isVoter: Boolean(voterInfo && (voterInfo as Voter).isRegistered),
    isVoterLoading,
    workflowStatus: workflowStatus as number | undefined,
    workflowLabel: workflowStatus !== undefined 
      ? WORKFLOW_LABELS[Number(workflowStatus)]
      : 'Chargement...',
    isWorkflowLoading,
    refetchAll: () => {
      //Tous les appels à refaire quand qq chose est mis à jour sur le contrat
      refetchOwner();
      refetchVoter();
      refetchWorkflow();
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}