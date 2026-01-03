// src/context/OwnerContext.tsx
import { createContext, useContext, type ReactNode } from 'react';
import { useAccount } from 'wagmi';
import useIsOwner from '../hooks/useIsOwner';

interface OwnerContextType {
    isOwner: boolean;
    isOwnerLoading: boolean;
    ownerAddress: string | undefined;
    isConnected: boolean;
    address: string | undefined;
    refetchOwner: () => void;
}

const OwnerContext = createContext<OwnerContextType | undefined>(undefined);

export function OwnerProvider({ children }: { children: ReactNode }) {
    const { address, isConnected } = useAccount();
    const {
        owner,
        isOwner,
        isLoading: isOwnerLoading,
        isError,
        error,
        refetch,
    } = useIsOwner(address);

    const value = {
        isOwner: isOwner ?? false,
        isOwnerLoading,
        ownerAddress: owner,
        isConnected,
        address,
        refetchOwner: refetch,
    };

    return (
        <OwnerContext.Provider value={value}>
            {children}
        </OwnerContext.Provider>
    );
}

// Hook personnalisé pour utiliser le context facilement
export function useOwner() {
    const context = useContext(OwnerContext);
    if (!context) {
        throw new Error('useOwner must be used within an OwnerProvider');
    }
    return context;
}