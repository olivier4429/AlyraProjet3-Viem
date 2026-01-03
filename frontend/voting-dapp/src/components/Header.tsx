import '@rainbow-me/rainbowkit/styles.css';
import { ConnectButton } from '@rainbow-me/rainbowkit';

import type { Address } from 'viem';
import type { Connector } from 'wagmi';


function DebugAccount({address, isConnected, connector, owner, isOwner, isLoading, isError, error}:{address:Address, isConnected:boolean, connector:Connector, owner:Address, isOwner:boolean, isLoading:boolean, isError:boolean, error:string}) {

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


export default function Header({address, isConnected, connector, owner, isOwner, isLoading, isError, error}:{address:Address, isConnected:boolean, connector:Connector, owner:Address, isOwner:boolean, isLoading:boolean, isError:boolean, error:string}) {

    return (
        <div>
            <DebugAccount address={address}/>
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