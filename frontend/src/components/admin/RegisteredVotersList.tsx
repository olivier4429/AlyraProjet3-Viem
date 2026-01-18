
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Users, CheckCircle2 } from 'lucide-react';
import {  WORKFLOW_STATUS } from '@/constants';
import CustomMessageCard from '../shared/CustomMessageCard';
import { useApp } from '@/contexts/AppContext';
import { useListVoters } from '@/hooks/useListVoters';



export default function RegisteredVotersList() {

  const TITLE = "Liste des voteurs";
  const { isConnected, workflowStatus } = useApp();


  const {voters} = useListVoters();

  

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


  if (workflowStatus === undefined || workflowStatus < WORKFLOW_STATUS.RegisteringVoters) {
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
        {voters.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            Aucun votant enregistré pour le moment
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {voters.map((voter, index) => (
              <div
                key={`${voter}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="font-mono text-sm font-medium">
                      {formatAddress(voter)}
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