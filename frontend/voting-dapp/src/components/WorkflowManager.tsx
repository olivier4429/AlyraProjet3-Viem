import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESS, type WorkflowFunction, WORKFLOW_FUNCTIONS, WORKFLOW_STATUS, WORKFLOW_LABELS } from "../constants";
import { CONTRACT_ABI } from '../abi/voting'
import { useEffect } from "react";
import { useOwner } from '../contexts/OwnerContext';  // Import du context
import { Button } from "@/components/ui/button"
import CustomMessageCard from "@/components/CustomMessageCard"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
export default function WorkflowManager() {

    const TITLE = "gestion du workflow";
    const {
        isOwner,
        isOwnerLoading,
        isConnected
    } = useOwner();


    /* ===== READ WORKFLOW STATUS ===== */
    const { data: workflowStatus, refetch } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "workflowStatus",
        query: {
            enabled: isOwner, // N'appelle que si propriétaire
        },
    });


    /* ===== WRITE CONTRACT ===== */
    const { writeContract, data: hash, isPending, isError, error } = useWriteContract();

    const { isSuccess: isConfirmed, isLoading: isMining } = useWaitForTransactionReceipt({
        hash,
    });


    /* ===== Rafraîchir après confirmation ===== */
    useEffect(() => {
        if (isConfirmed) {
            refetch();
        }
    }, [isConfirmed, refetch]);

    // Si connecté mais PAS owner → message d'accès refusé
    if (!isOwner) {
        return (
            <CustomMessageCard title={TITLE}>
                ❌ Accès refusé : Vous n'êtes pas le propriétaire du contrat.
            </CustomMessageCard>
        );
    }




    const isLoading = isPending || isMining;


    /* ===== ACTIONS ===== */
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



    // Si pas connecté ou en chargement → on affiche rien ou un message
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



    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Workflow management</CardTitle>
                <CardDescription>Faire avancer le workflow</CardDescription>
            </CardHeader>
            <CardContent>
                <div><strong>Current status :</strong>{" "}
                    <p>status ={workflowStatus} </p>
                    {workflowStatus !== undefined
                        ? WORKFLOW_LABELS[Number(workflowStatus)]
                        : "Loading..."}</div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                {!isLoading && action && (
                    <Button variant="default" className="w-full" onClick={() => advanceWorkflow(action.fn)}>
                        {action.label}
                    </Button>
                )}
                {!isLoading && !action && <p>Workflow completed</p>}
                {isLoading && <p style={{ color: 'blue' }}>Transaction en cours...</p>}
                {isError && <p style={{ color: 'red' }}>Erreur : {error?.message}</p>}
            </CardFooter>
        </Card>
    );
}
