'use client';
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import  useIsOwner  from '../hooks/useIsOwner'

export default function Header() {
    const { address, isConnected } = useAccount();
    const isOwner = useIsOwner();

    return (

        <div>Header :
            {isConnected ? (
                <p>Connected with {address}</p>
            ) : (
                <p>Please connect your Wallet.</p>
            )}
            <ConnectButton />
            {isOwner}

        </div>

    );
}
