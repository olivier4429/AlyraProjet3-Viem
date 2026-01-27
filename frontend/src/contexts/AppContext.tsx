import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { CONTRACT_ADDRESS, WORKFLOW_LABELS } from '../constants';
import { type Voter } from '@/types';
import { useOwner, useWorkflowStatus, useVoter } from '@/hooks';

interface AppContextType {
  // Connexion
  address: `0x${string}` | undefined;
  isConnected: boolean;

  // Owner
  isOwner: boolean;
  isOwnerLoading: boolean;
  ownerAddress: `0x${string}` | undefined;

  // Voter
  voterInfo: Voter | undefined;
  isVoter: boolean;
  isVoterLoading: boolean;

  // Workflow
  workflowStatus: number | undefined;
  workflowLabel: string;
  isWorkflowLoading: boolean;
  isWorkflowError: boolean;
  workflowError: string | null;

  // Actions
  refetchAll: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();

  const {
    owner,
    isOwner,
    isLoading: isOwnerLoading,
    refetch: refetchOwner,
  } = useOwner(address);

  const {
    workflowStatus,
    isLoading: isWorkflowLoading,
    isError: isWorkflowError,
    error: workflowError,
    refetch: refetchWorkflow,
  } = useWorkflowStatus(isConnected);

  const {
    voterInfo,
    isLoading: isVoterLoading,
    refetch: refetchVoter,
  } = useVoter(address, workflowStatus as number | undefined);

  const refetchAll = useCallback(() => {
    refetchOwner();
    refetchVoter();
    refetchWorkflow();
  }, [refetchOwner, refetchVoter, refetchWorkflow]);

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
    workflowLabel:
      workflowStatus !== undefined
        ? WORKFLOW_LABELS[Number(workflowStatus)]
        : 'Inconnu',
    isWorkflowLoading,
    isWorkflowError,
    workflowError: workflowError?.message ?? null,
    refetchAll,
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
