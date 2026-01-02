import '@rainbow-me/rainbowkit/styles.css';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

import { useEffect } from 'react';
import useIsOwner from '../hooks/useIsOwner'


function DebugAccount() {
    const { address, isConnected, connector } = useAccount();
    const { owner, isOwner, isLoading, isError, error, refetch } = useIsOwner(address)
    return (
        <div style={{ background: '#f00', color: 'white', padding: '10px', margin: '10px' }}>
            <strong>DEBUG WAGMI:</strong><br />
            Address: {address || 'undefined'}<br />
            Connected: {isConnected ? 'true' : 'false'}<br />
            Connector: {connector?.name || 'none'}<br />
            <button onClick={() => refetch()}>🔄 Refetch owner manually</button><br /><br />
            Owner loading: {isLoading ? '⏳' : '✅'}<br />
            Owner error: {isError ? `❌ ${error?.message}` : 'None'}<br />
            Contract owner: {owner || 'undefined'}<br />
            You are owner: {isOwner ? 'YES 🎉' : 'No'}
        </div>
    );
}


export default function Header() {
    const { address, isConnected } = useAccount();


    useEffect(() => {
        console.log('🔥 useEffect CALLED', Date.now());
        console.log('=====================> wagmi state:', { address, isConnected });
    }, [address, isConnected]);

    return (
        <div>
            <DebugAccount />
            Header :
            {isConnected ? (
                <p>Connected with {address}</p>
            ) : (
                <p>Please connect your Wallet.</p>
            )}
            <ConnectButton />
        </div>
    );
}