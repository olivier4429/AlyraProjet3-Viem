import { useEffect, useState } from "react";
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ABI } from '@/abi/voting';
import { CONTRACT_ADDRESS } from "@/constants";

interface ContractStatus {
    isContractFound: boolean;
    isLoading: boolean;
    isError: boolean;
    error: string | null;
    bytecodeLenghth: number | null;
    network: string;
}

export function ContractStatus(): ContractStatus {
    const { chain } = useAccount();
    const { status, setStatus } = useState<ContractStatus>({
        isContractFound: false,
        isLoading: false,
        isError: false,
        error: null,
        bytecodeLenghth: null,
        network: chain?.name || 'non connecté'
    });

}