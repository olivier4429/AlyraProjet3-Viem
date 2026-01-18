import { useEffect, useState } from 'react';
import {  usePublicClient } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Users, CheckCircle2 } from 'lucide-react';
import { CONTRACT_ADDRESS, WORKFLOW_STATUS } from '@/constants';
import type { Address } from 'viem';
import CustomMessageCard from '../shared/CustomMessageCard';
import { useApp } from '@/contexts/AppContext';


interface VoterRegisteredEvent {
  voterAddress: Address;
  blockNumber: bigint;
}

export default function RegisteredVotersList() {

  const TITLE = "Liste des voteurs";
  const {  isConnected, workflowStatus } = useApp();

  const [voters, setVoters] = useState<VoterRegisteredEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const publicClient = usePublicClient();

  useEffect(() => {
    const fetchVoters = async () => {
      if (!publicClient) return;

      try {
        setIsLoading(true);

        // Récupérer tous les événements VoterRegistered
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

        // Extraire les adresses des votants
        const votersList: VoterRegisteredEvent[] = logs.map((log) => ({
          voterAddress: log.args.voterAddress as Address,
          blockNumber: log.blockNumber
        }));

        setVoters(votersList);
      } catch (error) {
        console.error('Erreur lors de la récupération des votants:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVoters();
  }, [publicClient]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };


  // Vérifications
  if (!isConnected) {
    return (
      <CustomMessageCard title={TITLE}>
        ⚠️ Connectez votre wallet pour accéder aux fonctions d'administration.
      </CustomMessageCard>
    );
  }


  if (workflowStatus===undefined || workflowStatus < WORKFLOW_STATUS.RegisteringVoters) {
    return (
      <CustomMessageCard title={TITLE}>
        ⏸️ L'enregistrement des votants n'a pas encore commencé.
      </CustomMessageCard>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Votants enregistrés ({voters.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4 text-gray-500">
            Chargement...
          </div>
        ) : voters.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            Aucun votant enregistré pour le moment
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {voters.map((voter, index) => (
              <div
                key={`${voter.voterAddress}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="font-mono text-sm font-medium">
                      {formatAddress(voter.voterAddress)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Bloc #{voter.blockNumber.toString()}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  #{index + 1}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}