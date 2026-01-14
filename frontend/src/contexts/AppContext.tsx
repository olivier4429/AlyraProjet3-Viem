import { createContext, useContext, type ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { WORKFLOW_LABELS } from '../constants';
import { type Voter } from '@/types';
import useOwner from '@/hooks/useOwner';
import useWorkflowStatus from '@/hooks/useWorkflowStatus';
import useVoter from '@/hooks/useVoter';

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
  const { address:addressConnected, isConnected } = useAccount();

  // Owner info
  const {
    owner,
    isOwner,
    isLoading: isOwnerLoading,
    refetch: refetchOwner,
  } = useOwner(addressConnected);

  // Workflow status
  const {
    workflowStatus,
    isLoading: isWorkflowLoading,
    refetch: refetchWorkflow,
  } = useWorkflowStatus(isConnected);

  // Voter info
  const {
    voterInfo,
    isLoading: isVoterLoading,
    refetch: refetchVoter,
  } = useVoter(addressConnected,workflowStatus);




  const value: AppContextType = {
    address:addressConnected,
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
      : 'Inconnu',
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
