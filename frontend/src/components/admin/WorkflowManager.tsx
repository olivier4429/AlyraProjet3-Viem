import { useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESS, type WorkflowFunction, WORKFLOW_FUNCTIONS, WORKFLOW_STATUS, WORKFLOW_LABELS } from "@/constants";
import { CONTRACT_ABI } from '@/abi/voting';
import { useApp } from '@/contexts/AppContext';
import { Button } from "@/components/ui/button";
import CustomMessageCard from "@/components/shared/CustomMessageCard";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function WorkflowManager() {
    const TITLE = "Gestion du workflow";
    const { isOwner, isOwnerLoading, isConnected, workflowStatus, workflowLabel, refetchAll } = useApp();

    const { writeContract, data: hash, isPending, isError, error } = useWriteContract();
    const { isSuccess: isConfirmed, isLoading: isMining } = useWaitForTransactionReceipt({ hash });

    // Refetch après confirmation
    useEffect(() => {
        if (isConfirmed) {
            refetchAll();
        }
    }, [isConfirmed, refetchAll]);

    const isLoading = isPending || isMining;

    const advanceWorkflow = (functionName: WorkflowFunction) => {
        writeContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName,
        });
    };

    const WORKFLOW_ACTIONS: Record<number, {
        label: string;
        fn: WorkflowFunction;
    }> = {
        [WORKFLOW_STATUS.RegisteringVoters]: {
            label: WORKFLOW_LABELS[WORKFLOW_STATUS.ProposalsRegistrationStarted],
            fn: WORKFLOW_FUNCTIONS.START_PROPOSALS,
        },
        [WORKFLOW_STATUS.ProposalsRegistrationStarted]: {
            label: WORKFLOW_LABELS[WORKFLOW_STATUS.ProposalsRegistrationEnded],
            fn: WORKFLOW_FUNCTIONS.END_PROPOSALS,
        },
        [WORKFLOW_STATUS.ProposalsRegistrationEnded]: {
            label: WORKFLOW_LABELS[WORKFLOW_STATUS.VotingSessionStarted],
            fn: WORKFLOW_FUNCTIONS.START_VOTING,
        },
        [WORKFLOW_STATUS.VotingSessionStarted]: {
            label: WORKFLOW_LABELS[WORKFLOW_STATUS.VotingSessionEnded],
            fn: WORKFLOW_FUNCTIONS.END_VOTING,
        },
        [WORKFLOW_STATUS.VotingSessionEnded]: {
            label: WORKFLOW_LABELS[WORKFLOW_STATUS.VotesTallied],
            fn: WORKFLOW_FUNCTIONS.TALLY,
        },
    };

    const action = workflowStatus !== undefined
        ? WORKFLOW_ACTIONS[Number(workflowStatus)]
        : undefined;

    // Vérifications
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

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Gestion du workflow</CardTitle>
                <CardDescription>Faire avancer le processus de vote</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div>
                        <strong>Statut actuel :</strong>
                        <p className="text-lg text-blue-600 font-semibold mt-1">
                            {workflowLabel}
                        </p>
                    </div>
                    {workflowStatus !== undefined && (
                        <p className="text-sm text-gray-500">
                            Phase {workflowStatus}/5
                        </p>
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                {!isLoading && action && (
                    <Button 
                        variant="default" 
                        className="w-full" 
                        onClick={() => advanceWorkflow(action.fn)}
                    >
                        → {action.label}
                    </Button>
                )}
                {!isLoading && !action && (
                    <p className="text-green-600 font-semibold">
                        ✓ Workflow terminé
                    </p>
                )}
                {isLoading && (
                    <p className="text-blue-600">
                        Transaction en cours...
                    </p>
                )}
                {isError && (
                    <p className="text-red-600 text-sm">
                        Erreur : {error?.message}
                    </p>
                )}
                {isConfirmed && (
                    <p className="text-green-600 text-sm">
                        ✓ Transition effectuée avec succès !
                    </p>
                )}
            </CardFooter>
        </Card>
    );
}