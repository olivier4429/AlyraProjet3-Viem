'use client';
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import useIsOwner from '../hooks/useIsOwner'
import useStatusVoter from '../hooks/useStatusVoter'

export default function Header() {
    const { address, isConnected } = useAccount();
    console.log("addresse=",address," isConnected=",isConnected)
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
        </div>

    );
}
