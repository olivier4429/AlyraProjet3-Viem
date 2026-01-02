'use client';
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { useEffect } from 'react'

import useIsOwner from '../hooks/useIsOwner'
import useStatusVoter from '../hooks/useStatusVoter'


function DebugAccount() {
    const { address, isConnected, status } = useAccount()


    return (
        <pre>
            ===============================================================<br />
            {JSON.stringify({ address, isConnected, status }, null, 2)}<br />
            ===============================================================
        </pre>
    )
}


export default function Header() {
    const { address, isConnected } = useAccount();
    //Pourl ogguer l'addresse. Pas util sinon
    console.log('🔁 render Header')
    useEffect(() => {
         console.log('🔥 useEffect CALLED', Date.now())
        console.log('=====================> wagmi state:', { address, isConnected })
    }, [address, isConnected])
    /////////////////////////

    const isOwner = useIsOwner(address);
    // 👇 hook toujours appelé, mais bloqué si owner
    const voter = useStatusVoter(address, !isOwner)


    return (

        <div>Header :
            {isConnected ? (
                <p>Connected with {address}</p>
            ) : (
                <p>Please connect your Wallet.</p>
            )}
            <ConnectButton />

            <p>Admin sur le contrat : {isOwner ? "oui" : "non"}</p>

            {voter && (
                <div>
                    <p>Inscrit : {voter.isRegistered ? 'oui' : 'non'}</p>
                    <p>A voté : {voter.hasVoted ? 'oui' : 'non'}</p>
                    <p>Vote : {voter.votedProposalId.toString()}</p>
                </div>
            )}

            <DebugAccount />
        </div>
    );
}
