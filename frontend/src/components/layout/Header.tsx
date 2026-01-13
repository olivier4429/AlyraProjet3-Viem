import '@rainbow-me/rainbowkit/styles.css';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useApp } from '@/contexts/AppContext';

export default function Header() {
    const {  isConnected, isOwner, workflowLabel } = useApp();

    return (
        <header className="border-b p-4">
            <div className="container mx-auto flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Système de Vote</h1>
                    {isConnected && (
                        <div className="text-sm text-gray-600 mt-1">
                            <p>Statut: {workflowLabel}</p>
                            {isOwner && <span className="text-blue-600 font-semibold">👑 Administrateur</span>}
                        </div>
                    )}
                </div>
                <div>
                    <ConnectButton />
                </div>
            </div>
        </header>
    );
}
