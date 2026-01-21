
import type { Address } from 'viem';
import { usePublicClient, useWatchContractEvent } from 'wagmi';
import { CONTRACT_ADDRESS } from '@/constants';
import { CONTRACT_ABI } from '@/abi/voting';

import { useState, useCallback, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';

export function useListVoters() {
    const { isConnected, isVoter } = useApp();
    const [voters, setVoters] = useState<Address[]>([]);



    const publicClient = usePublicClient();


    // 📥 Fonction de fetch pour l'historique recuperer l'ensemble des votants autorisés.
    // Pas de fetch sur les evenements donc on doit en developper un custom.
    const fetchVoters = useCallback(async () => {
        if (!publicClient) {
            return;
        }

        try {
            // Récupérer TOUS les événements passés
            const logs = await publicClient.getLogs({
                address: CONTRACT_ADDRESS,
                event: {
                    type: 'event',
                    name: 'VoterRegistered',
                    inputs: [
                        { type: 'address', name: 'voterAddress', indexed: false }
                    ]
                },
                fromBlock: 'earliest',
                toBlock: 'latest'
            });

            const addressesList: Address[] = logs.map((log) =>
                log.args.voterAddress as Address
            );

            setVoters(addressesList);
        } catch (err) {
            console.error('Erreur lors de la récupération des votants:', err);
            setVoters([]);
        } finally {
        }
    }, [publicClient]);



    //PARTIE 2: Chargement initial des votants au montage du hook
    useEffect(() => {
        if (!isConnected || !publicClient) return;
        fetchVoters();
    }, [isConnected, publicClient]);



    // Écoute des NOUVEAUX événements en temps réel. Evenements potentiellement déposés sur une autre instance de la page web avec un admin loggé.
    useWatchContractEvent({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        eventName: 'VoterRegistered',
        onLogs(logs) {
            // Ajouter les nouveaux votants à la liste existante
            const newAddresses = logs.map((log) =>
                log.args.voterAddress as Address
            );

            // Mettre à jour les états
            setVoters((prev) => {
                // ✅ Ajouter seulement les nouvelles adresses non présentes
                const combined = [...prev];
                for (const addr of newAddresses) {
                    if (!combined.some(v => v.toLowerCase() === addr.toLowerCase())) {
                        combined.push(addr);
                    }
                }
                return combined;
            });
        },
    });

    return {
        //Données
        voters,
        //Méthodes
        refetchVoters: fetchVoters, //pour qu'on puisse rafraichir suite à l'ajout d'un votant.
    }

}

export default useListVoters;