import { useState, useCallback } from 'react';
import { isAddress } from 'viem';
import { useApp } from '@/contexts/AppContext';
import { useContractWrite } from '@/hooks';
import { WORKFLOW_STATUS } from '@/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, UserPlus } from 'lucide-react';
import CustomMessageCard from '@/components/shared/CustomMessageCard';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const TITLE = 'Enregistrement des voteurs';

export default function AddVoter() {
  const { isOwner, isOwnerLoading, isConnected, workflowStatus, refetchAll } = useApp();
  const [address, setAddress] = useState('');

  const onSuccess = useCallback(() => {
    setAddress('');
    refetchAll();
  }, [refetchAll]);

  const { write, isLoading, isConfirmed, isError, error } = useContractWrite({
    onSuccess,
  });

  const handleAddVoter = () => {
    if (!isAddress(address)) {
      alert('Veuillez saisir une adresse Ethereum valide.');
      return;
    }
    write('addVoter', [address]);
  };

  // Vérifications d'accès
  if (!isConnected) {
    return (
      <CustomMessageCard title={TITLE}>
        ⚠️ Connectez votre wallet pour accéder aux fonctions d'administration.
      </CustomMessageCard>
    );
  }

  if (isOwnerLoading) {
    return (
      <CustomMessageCard title={TITLE}>
        Vérification de vos droits d'administrateur...
      </CustomMessageCard>
    );
  }

  if (!isOwner) {
    return (
      <CustomMessageCard title={TITLE}>
        ❌ Accès refusé : Vous n'êtes pas le propriétaire du contrat.
      </CustomMessageCard>
    );
  }

  if (workflowStatus !== WORKFLOW_STATUS.RegisteringVoters) {
    return (
      <CustomMessageCard title={TITLE}>
        ⏸️ L'enregistrement des voteurs n'est possible qu'en phase initiale.
      </CustomMessageCard>
    );
  }

  const isValidAddress = isAddress(address);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Enregistrer un électeur
        </CardTitle>
        <CardDescription>
          Ajoutez une adresse à la liste blanche (Whitelist).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Input
            placeholder="0x..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={isLoading}
            className={!isValidAddress && address !== '' ? 'border-red-500' : ''}
          />
          {address !== '' && !isValidAddress && (
            <p className="text-xs text-red-500">Adresse invalide</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Button
          className="w-full"
          onClick={handleAddVoter}
          disabled={isLoading || !isValidAddress}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            "Ajouter l'adresse"
          )}
        </Button>

        {isConfirmed && (
          <p className="text-sm text-green-600 font-medium">
            ✓ L'adresse a été ajoutée avec succès !
          </p>
        )}
        {isError && (
          <p className="text-sm text-red-600">Erreur : {error?.message}</p>
        )}
      </CardFooter>
    </Card>
  );
}
