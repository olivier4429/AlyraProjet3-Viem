import { useApp } from '@/contexts/AppContext';

export default function Footer() {
    const { isConnected, address, workflowLabel } = useApp();

    return (
        <footer className="border-t mt-auto">
            <div className="container mx-auto p-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
                    <div>
                        <p className="font-semibold">Système de Vote Décentralisé</p>
                    </div>
                    
                    {isConnected && (
                        <div className="text-center md:text-right">
                            <p className="text-xs">
                                Connecté: {address?.slice(0, 6)}...{address?.slice(-4)}
                            </p>
                            <p className="text-xs text-blue-600">
                                Statut: {workflowLabel}
                            </p>
                        </div>
                    )}
                    
                    <div className="text-xs text-gray-500">
                        © 2026 - Projet Web3
                    </div>
                </div>
            </div>
        </footer>
    );
}